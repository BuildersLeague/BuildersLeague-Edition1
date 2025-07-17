'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import ImagePreviewModal from '@/components/Overlay/Modals/image-preview-modal'

import Link from 'next/link'
import { toast } from 'sonner'
import signOut, {
  updateProfile,
  updateProfileImage,
} from '../app/emp/(authenticated)/profile-settings/actions'
import { useRouter } from 'next/navigation'
import { ProfileSummary } from '@/types/profile'
import { Camera } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { Avatar } from '@/components/Avatar'

interface ProfileSettingProps {
  initialProfile: ProfileSummary & { avatar_url?: string | null }
}

const compressImage = async (file: File): Promise<File> => {
  // Initial quality check
  if (file.size <= 5 * 1024 * 1024) {
    return file // If already under 5MB, return original
  }

  // Start with high quality settings
  const options = {
    maxSizeMB: 4.9, // Just under 5MB to be safe
    maxWidthOrHeight: 2048, // Maintain good resolution
    initialQuality: 0.9, // Start with high quality
    useWebWorker: true,
    fileType: file.type as string | undefined,
  }

  try {
    let compressedFile = await imageCompression(file, options)

    // If still too large, try again with reduced quality
    if (compressedFile.size > 5 * 1024 * 1024) {
      options.initialQuality = 0.8
      options.maxWidthOrHeight = 1600
      compressedFile = await imageCompression(file, options)
    }

    // Final fallback with more aggressive compression if still too large
    if (compressedFile.size > 5 * 1024 * 1024) {
      options.initialQuality = 0.7
      options.maxWidthOrHeight = 1200
      compressedFile = await imageCompression(file, options)
    }

    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

export const ProfileSetting = ({ initialProfile }: ProfileSettingProps) => {
  const router = useRouter()
  const [fileContent, setFileContent] = useState<string | null>(
    initialProfile.avatar_url || null,
  )
  const [previewImageURL, setPreviewURL] = useState<string>('')
  const [fileToSend, setFileToSend] = useState<File | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [profileData, setProfileData] = useState(initialProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await updateProfile(profileData)

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success('Profile updated successfully!')
      router.refresh()
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const profileChangeHandler = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Show loading state with file size info
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      toast.loading(
        `Processing image (${sizeMB}MB)${file.size > 5 * 1024 * 1024 ? ' - Compressing...' : ''}`,
      )

      // Compress if needed
      const processedFile = await compressImage(file)
      const finalSizeMB = (processedFile.size / (1024 * 1024)).toFixed(2)

      // Create preview
      const fileReader = new FileReader()
      fileReader.onload = (evt: ProgressEvent<FileReader>) => {
        setPreviewURL(evt.target?.result as string)
        setFileToSend(processedFile)
        setModalOpen(true)
        toast.dismiss()

        // Show compression result if compressed
        if (processedFile !== file) {
          toast.success(`Image compressed from ${sizeMB}MB to ${finalSizeMB}MB`)
        }
      }
      fileReader.readAsDataURL(processedFile)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to process image',
      )
      event.target.value = ''
    }
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.error) {
      toast.error(result.error)
    } else {
      router.push('/')
    }
  }

  const onModalClose = () => setModalOpen(false)

  const onConfirm = async () => {
    if (!fileToSend) return

    try {
      toast.loading('Uploading image...')

      const arrayBuffer = Array.from(
        new Uint8Array(await fileToSend.arrayBuffer()),
      )

      const result = await updateProfileImage({
        name: fileToSend.name,
        type: fileToSend.type,
        arrayBuffer,
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.url) {
        setFileContent(result.url)
        toast.success('Profile image updated successfully!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setModalOpen(false)
      toast.dismiss()
    }
  }

  return (
    <>
      <ImagePreviewModal
        imageURL={previewImageURL}
        onReset={onModalClose}
        onConfirm={onConfirm}
        isLoading={isLoading}
        isOpen={isModalOpen}
      />
      <div className="container mx-auto max-w-2xl p-2 sm:p-4">
        <div className="relative h-24 bg-gradient-to-r from-blue-500 to-blue-600 sm:h-32" />
        <div className="relative px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative mx-auto -mt-12 sm:mx-0 sm:-mt-16">
              <Avatar
                src={fileContent}
                name={initialProfile.name}
                className="h-24 w-24 text-xl font-medium"
              />
              <button
                onClick={() =>
                  (
                    document.querySelector(
                      'input[type="file"]',
                    ) as HTMLInputElement
                  )?.click()
                }
                className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-lg transition-colors hover:bg-gray-50"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={profileChangeHandler}
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold sm:text-2xl">
                {profileData.name}
              </h1>
              <p className="text-sm text-gray-500">{profileData.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-3 sm:px-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                disabled={true}
                readOnly={true}
                value={profileData.email}
                placeholder="Enter your email"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_info">Contact Info</Label>
              <Input
                id="contact_info"
                value={profileData.contact_info}
                onChange={handleInputChange}
                placeholder="123-456-7890"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              className="h-10 w-full"
              onClick={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/emp/profile-settings/change-password"
                className="w-full"
              >
                <Button variant="outline" className="h-10 w-full">
                  Change Password
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="h-10 w-full"
                onClick={handleSignOut}
              >
                Logout
              </Button>
              <Link href="/cbh/about" className="w-full">
                <Button variant="ghost" className="h-10 w-full">
                  Help
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import React, { useState, useEffect } from 'react'
import { createBrowserClient } from '@/utils/supabase'
import { toast } from 'sonner'

interface NewSurveyProps {
  onClose: () => void
}

interface SurveyFormData {
  name: string
  link: string
  date: string
  time: string
  targetOrgs: string[]
}

interface Organization {
  id: string
  name: string
  email: string
  is_active: boolean
}

const NewSurvey: React.FC<NewSurveyProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [formData, setFormData] = useState<SurveyFormData>({
    name: '',
    link: '',
    date: '',
    time: '',
    targetOrgs: [],
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, is_active')
          .eq('role', 2)
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (error) throw error

        setOrganizations(data || [])
      } catch (err) {
        console.error('Error fetching organizations:', err)
        toast.error('Failed to load organizations')
      } finally {
        setLoadingOrgs(false)
      }
    }

    fetchOrganizations()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id.replace('survey-', '')]: value,
    }))
  }

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      targetOrgs: checked
        ? [...prev.targetOrgs, value]
        : prev.targetOrgs.filter((org) => org !== value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.name || !formData.link || !formData.date) {
        throw new Error('Please fill in all required fields')
      }

      if (formData.targetOrgs.length === 0) {
        throw new Error('Please select at least one target organization')
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const dateTime = formData.time
        ? `${formData.date}T${formData.time}:00`
        : `${formData.date}T00:00:00`

      const surveyPromises = formData.targetOrgs.map(async (orgId) => {
        const { data, error } = await supabase
          .from('survey')
          .insert({
            link: formData.link,
            organization_id: orgId === '*' ? user.id : orgId,
            created_at: dateTime,
            status: true,
          })
          .select()

        if (error) throw error
        return data
      })

      await Promise.all(surveyPromises)

      toast.success('Survey created successfully!')

      setFormData({
        name: '',
        link: '',
        date: '',
        time: '',
        targetOrgs: [],
      })

      onClose()

      // Refresh the page to show updated data
      window.location.reload()
    } catch (err) {
      console.error('Error creating survey:', err)
      setError(err instanceof Error ? err.message : 'Failed to create survey')
      toast.error(
        err instanceof Error ? err.message : 'Failed to create survey',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">New Survey</h1>
      <button
        className="rounded-lg bg-gray-200 p-2 shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        onClick={onClose}
        disabled={loading}
      >
        Back
      </button>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="survey-name" className="block text-sm font-medium">
            Survey Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="survey-name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter survey name"
            required
            disabled={loading}
            className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:ring focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="survey-link" className="block text-sm font-medium">
            Link to Survey <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="survey-link"
            value={formData.link}
            onChange={handleInputChange}
            placeholder="Enter link to survey"
            required
            disabled={loading}
            className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:ring focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="survey-date" className="block text-sm font-medium">
            Survey Date <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <input
              type="date"
              id="survey-date"
              value={formData.date}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:ring focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            <input
              type="time"
              id="survey-time"
              value={formData.time}
              onChange={handleInputChange}
              disabled={loading}
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:ring focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium">
            Target Organizations <span className="text-red-500">*</span>
          </span>

          {loadingOrgs ? (
            <div className="mt-2 text-sm text-muted-foreground">
              Loading organizations...
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="*"
                  checked={formData.targetOrgs.includes('*')}
                  onChange={handleOrgChange}
                  disabled={loading}
                  className="mr-2 disabled:cursor-not-allowed"
                />
                All Organizations
              </label>

              {organizations.map((org) => (
                <label key={org.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={org.id}
                    checked={formData.targetOrgs.includes(org.id)}
                    onChange={handleOrgChange}
                    disabled={loading}
                    className="mr-2 disabled:cursor-not-allowed"
                  />
                  <span className="flex-1">{org.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({org.email})
                  </span>
                </label>
              ))}

              {organizations.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No active organizations found
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <button
          className="w-full rounded-lg bg-blue-600 p-4 text-white shadow-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-800 dark:hover:bg-blue-700"
          type="submit"
          disabled={loading || loadingOrgs}
        >
          {loading ? 'Creating Survey...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

export default NewSurvey

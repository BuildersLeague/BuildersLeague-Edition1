import * as React from 'react'
import { X as CloseIcon, Menu as MenuIcon, ArrowRight } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from '@/components/ui/drawer'
import Link from 'next/link'
import { createBrowserClient } from '@/utils/supabase'
import { mockTopics } from '@/mocks/topic'

import { useEffect, useState } from 'react'

interface Schedule {
  parent_id: number
  schedules: ScheduleTrimmed
}

interface ScheduleTrimmed {
  id: number
  topic_id: string
  schedule_at: number
}

export default function MenuDrawer() {
  const [topics, setTopics] = useState<[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTopics()
  }, [])

  const getTopics = async () => {
    try {
      setLoading(true)

      let data: any = { docs: [] }

      try {
        const response = await fetch(`/api/topics`, {
          cache: 'no-cache',
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        data = await response.json()

        // Ensure data.docs exists
        if (!data.docs) {
          data.docs = []
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error)
        // Use mock data as fallback
        data = { docs: mockTopics || [] }
      }

      const supabase = createBrowserClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      // Get user's organization id
      const org_id = await supabase
        .from('profiles')
        .select('admin_id')
        .eq('id', user?.id)

      // Get a list of schedule for the content for the org that this user belong to
      // I joined the schedule_organizations with schedules table (default join at the refrence key at
      // schedule_organizations(parent_id) and schedules(id)) to get the list of topic_id and
      // schedule_at on schedules table
      let schedules: any = []
      if (org_id.data && org_id.data.length > 0) {
        try {
          const schedulesResult = await supabase
            .from('schedule_organizations')
            .select(`parent_id, schedules(id, topic_id, schedule_at)`)
            .eq('organization_id', org_id.data[0].admin_id)

          if (schedulesResult.data) {
            schedules = schedulesResult.data
              .flatMap((item: any) =>
                Array.isArray(item.schedules)
                  ? item.schedules
                  : [item.schedules],
              )
              .filter(Boolean)
          }
        } catch (error) {
          console.error('Failed to fetch schedules:', error)
        }
      }

      // Filter topics based on schedules, with error handling
      if (data.docs && Array.isArray(data.docs)) {
        data.docs = data.docs.filter((topic: any) => {
          if (!schedules || !Array.isArray(schedules)) {
            return true
          }

          const schedule_item = schedules.find(
            (schedule: ScheduleTrimmed) => schedule.topic_id === topic.id,
          )
          if (schedule_item !== undefined) {
            const now = Date.now()
            const scheduleTime = new Date(schedule_item.schedule_at).getTime()
            return scheduleTime < now
          }
          return true
        })
      }

      setTopics(data.docs || [])
    } catch (error) {
      console.error('Error in getTopics:', error)
      setTopics([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <button>
          <MenuIcon className="h-8 w-8" aria-hidden="true" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex h-full w-full flex-col">
          <DrawerHeader>
            <div className="flex w-full items-center justify-between">
              <h2 className="text-xl font-bold">Course Topics</h2>
              <DrawerClose asChild>
                <button>
                  <CloseIcon className="h-8 w-8" aria-hidden="true" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-gray-500">Loading topics...</p>
              </div>
            ) : topics && topics.length > 0 ? (
              topics.map((topic: any) => (
                <div
                  className="flex justify-between gap-2 border border-b"
                  key={topic?.id}
                >
                  <DrawerClose asChild>
                    <Link
                      href={`/emp/topics/${topic?.id}`}
                      className="flex w-full items-center justify-between px-5 py-8"
                    >
                      <p className="flex-1 pr-5">{topic?.title}</p>
                      <div className="flex items-center gap-2">
                        <p className=" ">{topic?.progress ?? 0}%</p>
                        <ArrowRight className="h-6 w-6" aria-hidden="true" />
                      </div>
                    </Link>
                  </DrawerClose>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-8">
                <p className="text-gray-500">No topics available</p>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

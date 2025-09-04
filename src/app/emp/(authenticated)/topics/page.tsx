import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { mockTopics } from '@/mocks/topic'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase'

interface Schedule {
  parent_id: number
  schedules: ScheduleTrimmed
}

interface ScheduleTrimmed {
  id: number
  topic_id: string
  schedule_at: number
}
export default async function Page() {
  const apiUrl: string = process.env.CMS_API_URL as string
  const endpoint = `/topics`
  const apiKey: string = process.env.CMS_API_KEY as string
  const response = await fetch(apiUrl + endpoint, {
    cache: 'no-cache',
    headers: {
      Authorization: `users API-Key ${apiKey}`,
    },
  })

  let data = await response.json()

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

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
  let schedules: any
  if (org_id.data) {
    schedules = await supabase
      .from('schedule_organizations')
      .select(`parent_id, schedules(id, topic_id, schedule_at)`)
      .eq('organization_id', org_id.data[0].admin_id)
    if (schedules.data) {
      schedules = schedules.data.map((schedule: Schedule) => schedule.schedules)
    }
  }

  data.docs = data.docs.filter((topic: any) => {
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

  console.log(data.docs)
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Topics List</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.docs.map((topic: any, index: number) => (
          <Link key={index} href={`/emp/topics/${topic.id}`}>
            <Card className="flex flex-col hover:bg-gray-100">
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col justify-between">
                <p className="mb-4 text-sm text-muted-foreground">
                  {topic.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Contents: {topic.contentsQuantity}</span>
                    <span>{topic.progress ?? 0}% Complete</span>
                  </div>
                  <Progress value={topic.progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

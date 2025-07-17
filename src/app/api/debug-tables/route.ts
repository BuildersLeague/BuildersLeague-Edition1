import { NextResponse } from 'next/server'
import { createBrowserClient } from '@/utils/supabase'

export async function GET() {
  try {
    const supabase = createBrowserClient()

    // Try to query some common table names to see which ones exist
    const testTables = ['notes', 'Notes', 'profiles', 'users', 'auth.users']
    const tableTests = []

    for (const tableName of testTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        tableTests.push({
          table: tableName,
          exists: !error,
          error: error?.message || null,
          sampleData: data?.[0] || null,
          dataCount: data?.length || 0
        })
      } catch (e) {
        tableTests.push({
          table: tableName,
          exists: false,
          error: (e as Error).message,
          sampleData: null,
          dataCount: 0
        })
      }
    }

    return NextResponse.json({
      tableTests,
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })

  } catch (error) {
    console.error('Debug tables error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createBrowserClient } from '@/utils/supabase'

export async function GET() {
  try {
    const supabase = createBrowserClient()

    console.log('Testing notes fetch...')
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .limit(5)

    if (error) {
      console.error('Error fetching notes:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 })
    }

    console.log('Successfully fetched notes:', data)

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      notes: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

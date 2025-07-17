import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const apiUrl = process.env.CMS_API_URL
  const endpoint = `/topics`
  const apiKey = process.env.CMS_API_KEY
  try {
    // Add timeout to prevent long loading times
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(apiUrl + endpoint, {
      cache: 'force-cache', // Use cache instead of no-cache
      headers: {
        Authorization: `users API-Key ${apiKey}`,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }
    const data = await response.json()
    const responseData = {
      ...data,
      progress: 50,
    }

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      },
    })
  } catch (error) {
    console.error('Topics API error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    )
  }
}

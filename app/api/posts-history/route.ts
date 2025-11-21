import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const tenantCode = searchParams.get('tenantCode')
    
    let startDate: string
    let endDate: string
    
    if (fromDate && toDate) {
      startDate = new Date(fromDate).toISOString()
      endDate = new Date(toDate).toISOString()
    } else {
      const days = parseInt(searchParams.get('days') || '30')
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      startDate = cutoffDate.toISOString()
      endDate = new Date().toISOString()
    }
    
    let q
    if (tenantCode) {
      q = query(
        collection(db, 'posts_history'),
        where('tenantCode', '==', tenantCode),
        where('postedAt', '>=', startDate),
        where('postedAt', '<=', endDate),
        orderBy('postedAt', 'desc')
      )
    } else {
      q = query(
        collection(db, 'posts_history'),
        where('postedAt', '>=', startDate),
        where('postedAt', '<=', endDate),
        orderBy('postedAt', 'desc')
      )
    }
    
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching posts history:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, ...dataWithoutId } = body
    const docRef = await addDoc(collection(db, 'posts_history'), {
      ...dataWithoutId,
      tenantCode: dataWithoutId.tenantCode || ''
    })
    return NextResponse.json({ id: docRef.id, ...dataWithoutId })
  } catch (error) {
    console.error('Error creating post history:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

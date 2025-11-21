import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'tenants'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, ...dataWithoutId } = body
    const docRef = await addDoc(collection(db, 'tenants'), dataWithoutId)
    return NextResponse.json({ id: docRef.id, ...dataWithoutId })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    const docRef = doc(db, 'tenants', id)
    await updateDoc(docRef, updateData)
    
    return NextResponse.json({ success: true, id, ...updateData })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    await deleteDoc(doc(db, 'tenants', id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

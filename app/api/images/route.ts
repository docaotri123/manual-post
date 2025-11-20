import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore'

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'images'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, ...dataWithoutId } = body
    const docRef = await addDoc(collection(db, 'images'), dataWithoutId)
    return NextResponse.json({ id: docRef.id, ...dataWithoutId })
  } catch (error) {
    console.error('Error creating image:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    console.log('DELETE request body:', body)
    
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    console.log('Attempting to delete document with ID:', id)
    
    // Verify document exists before deleting
    const docRef = doc(db, 'images', id)
    console.log('Document reference created for:', docRef.path)
    
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      console.log('Document does not exist:', id)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    
    console.log('Document exists, proceeding with deletion')
    await deleteDoc(docRef)
    console.log('Document deleted successfully')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

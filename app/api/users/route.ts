import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantCode = searchParams.get('tenantCode')
    
    let snapshot
    if (tenantCode) {
      const q = query(collection(db, 'users'), where('tenantCode', '==', tenantCode))
      snapshot = await getDocs(q)
    } else {
      snapshot = await getDocs(collection(db, 'users'))
    }
    
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    const q = query(
      collection(db, 'users'),
      where('username', '==', username),
      where('password', '==', password)
    )
    
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const user = snapshot.docs[0].data()
      return NextResponse.json({ success: true, user: { username: user.username, role: user.role } })
    }
    
    return NextResponse.json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const docRef = await addDoc(collection(db, 'users'), {
      ...body,
      tenantCode: body.tenantCode || ''
    })
    return NextResponse.json({ id: docRef.id, ...body })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await deleteDoc(doc(db, 'users', id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: customers } = await supabase.from('customers').select()

  return <pre>{JSON.stringify(customers)}</pre>
}
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: company } = await supabase.from('company').select()

  return <pre>{JSON.stringify(company)}</pre>
}
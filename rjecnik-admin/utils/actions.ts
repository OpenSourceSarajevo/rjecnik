'use server'

import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const signInWith = (provider: Provider) => async () => {
  const supabase = await createClient()

  const auth_callback_url = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`

  const { data } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  })

  redirect(data.url!)
}

const signinWithGoogle = signInWith('google')

const signOut = async () => {
  console.log('signing out')
  const supabase = await createClient()
  await supabase.auth.signOut()

  redirect("/auth")
}

export { signinWithGoogle, signOut }
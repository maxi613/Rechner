 interface IsuperbaseEnv{
    production: boolean, 
    url: string, 
    key: string
}

export const SuperbaseEnv: IsuperbaseEnv = {
    production: false, 
    url:"https://udfdldaijvfacfygxjhh.supabase.co",
    key:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZmRsZGFpanZmYWNmeWd4amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0OTI1NTEsImV4cCI6MjAzMjA2ODU1MX0.RJo3dfcRTt6VvGoWRfIxTEwsQ1sggjfkxoo6JKPxUis"
}

export const userLogin = {
    email: 'wiegandmaximilian@gmail.com', 
    pw: '123456'
}
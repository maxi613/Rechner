 interface IsuperbaseEnv{
    production: boolean, 
    url: string, 
    key: string
    token: string
}

export const SuperbaseEnv: IsuperbaseEnv = {
    production: false, 
    token: "sbp_46579fed4aae1cbbbc00cf232e47c1bd0eb4ce71",
    url:"https://udfdldaijvfacfygxjhh.supabase.co",
    key:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZmRsZGFpanZmYWNmeWd4amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY0OTI1NTEsImV4cCI6MjAzMjA2ODU1MX0.RJo3dfcRTt6VvGoWRfIxTEwsQ1sggjfkxoo6JKPxUis"
}

export const userLogin = {
    email: 'wiegandmaximilian@gmail.com', 
    pw: '123456'
}
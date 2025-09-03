 import { request } from "http";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";



export function middleware(req: NextRequest) {
  
const path = req.nextUrl.pathname;
const isPublicPath =  path === '/login' || path === '/register';


const token = req.cookies.get('token')?.value ||''

if(isPublicPath && token){
    return NextResponse.redirect(new URL('/',req.nextUrl))
}
if(!isPublicPath && !token){
    return NextResponse.redirect(new URL('/login',req.nextUrl))
}
}



export const config = {
    matcher:[
        '/',
        '/login',
        '/register',
    ]
}
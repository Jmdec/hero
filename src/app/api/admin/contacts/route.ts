import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export async function GET(request: NextRequest) {

  try {

    const query = new URL(request.url).search;

    const auth = request.headers.get("Authorization");


    const res = await fetch(
      `${API_URL}/api/admin/contacts${query}`,
      {
        headers:{
          Accept:"application/json",
          Authorization:auth ?? ""
        },
        cache:"no-store"
      }
    );


    const text = await res.text();


    return new NextResponse(text,{
      status:res.status,
      headers:{
        "Content-Type":"application/json"
      }
    });


  } catch(error){

    return NextResponse.json(
      {
        message:"Proxy failed",
        error:String(error)
      },
      {
        status:500
      }
    );

  }

}
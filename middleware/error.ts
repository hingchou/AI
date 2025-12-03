import { NextResponse } from "next/server";

export function handleApiError(error: any) {
  console.error("API Error:", error);
  
  return NextResponse.json(
    { 
      code: -1, 
      message: error.message || "Internal server error" 
    },
    { status: error.status || 500 }
  );
} 
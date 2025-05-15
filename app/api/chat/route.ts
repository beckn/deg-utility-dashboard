import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Call the external API
        const response = await fetch('https://api-deg-agents.becknprotocol.io/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "Transformer load limit exceeded",
                // You can add more data from the request body if needed
                // ...await request.json()
            })
        });

        const data = await response.json();

        // If external API fails, fallback to default message
        if (!response.ok) {
            return NextResponse.json({
                success: true,
                message: "I've detected that transformer TR-1234 has exceeded its load capacity by 15%. Would you like me to initiate the DFP (Demand Flexibility Program) to reduce the load? This will help prevent potential equipment damage and maintain grid stability."
            });
        }

        return NextResponse.json({
            success: true,
            message: data.message || data.response || data // Adjust based on actual API response structure
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        
        // Fallback response in case of error
        return NextResponse.json({
            success: true,
            message: "I've detected that transformer TR-1234 has exceeded its load capacity by 15%. Would you like me to initiate the DFP (Demand Flexibility Program) to reduce the load? This will help prevent potential equipment damage and maintain grid stability."
        });
    }
} 
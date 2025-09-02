import { NextResponse } from "next/server";

export async function GET() {
  const records = [
    {
      id: "1",
      houseName: "Shiv Villa",
      ownerName: "Rajesh Kumar",
      spouseName: "Meena Kumari",
      address: "123, Green Park, Delhi",
      imageUrl: "/images/lot1/house1.png",
    },
    {
      id: "2",
      houseName: "Gopal Niwas",
      ownerName: "Suresh Gupta",
      spouseName: "Anita Gupta",
      address: "45, MG Road, Mumbai",
      imageUrl: "/images/lot1/house2.png",
    },
    {
        id: "3",
        houseName: "Gopal Niwas",
        ownerName: "Suresh Gupta",
        spouseName: "Anita Gupta",
        address: "45, MG Road, Mumbai",
        imageUrl: "/images/lot1/house2.png",
      },
      {
        id: "4",
        houseName: "Gopal Niwas",
        ownerName: "Suresh Gupta",
        spouseName: "Anita Gupta",
        address: "45, MG Road, Mumbai",
        imageUrl: "/images/lot1/house2.png",
      },
      {
        id: "5",
        houseName: "Gopal Niwas",
        ownerName: "Suresh Gupta",
        spouseName: "Anita Gupta",
        address: "45, MG Road, Mumbai",
        imageUrl: "/images/lot1/house2.png",
      },
      {
        id: "6",
        houseName: "Gopal Niwas",
        ownerName: "Suresh Gupta",
        spouseName: "Anita Gupta",
        address: "45, MG Road, Mumbai",
        imageUrl: "/images/lot1/house2.png",
      },
  ];

  return NextResponse.json({ success: true, records });
}

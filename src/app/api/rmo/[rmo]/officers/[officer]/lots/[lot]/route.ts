import { NextResponse } from "next/server";

export async function GET() {
  const records = [
    {
      id: "1",
      houseName: "Mangal Villa",
      ownerName: "Arjun Deshmukh",
      spouseName: "Kavita Deshmukh",
      address: "101, Lake View Colony, Bhopal",
      imageUrl: "/images/lot1/house1.png",
    },
    {
      id: "2",
      houseName: "Surya Nivas",
      ownerName: "Deepak Joshi",
      spouseName: "Anjali Joshi",
      address: "12, Residency Road, Indore",
      imageUrl: "/images/lot1/house2.png",
    },
    {
      id: "3",
      houseName: "Vasant Kunj",
      ownerName: "Nitin Chawla",
      spouseName: "Poonam Chawla",
      address: "77, Civil Lines, Lucknow",
      imageUrl: "/images/lot1/house3.png",
    },
    {
      id: "4",
      houseName: "Shree Dham",
      ownerName: "Harish Patil",
      spouseName: "Smita Patil",
      address: "34, Camp Area, Nashik",
      imageUrl: "/images/lot1/house4.png",
    },
    {
      id: "5",
      houseName: "Rajdeep Villa",
      ownerName: "Vikram Singh",
      spouseName: "Priya Singh",
      address: "19, Cantonment, Jodhpur",
      imageUrl: "/images/lot1/house5.png",
    },
    {
      id: "6",
      houseName: "Gokul Sadan",
      ownerName: "Mahesh Iyer",
      spouseName: "Revathi Iyer",
      address: "88, Gandhi Nagar, Chennai",
      imageUrl: "/images/lot1/house6.png",
    },
  ];

  return NextResponse.json({ success: true, records });
}

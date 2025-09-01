import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import Nameplate from "@/models/Nameplate";
import Customer from "@/models/Customer";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { role, id: userId } = decoded;

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Base query filters
    const baseFilters = role === "admin" ? {} : { officerId: userId };

    // Get orders statistics
    const ordersStats = await Order.aggregate([
      { $match: baseFilters },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$finalAmount" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          inProductionOrders: {
            $sum: { $cond: [{ $eq: ["$status", "in_production"] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
          },
          overdueOrders: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [now, "$estimatedCompletionDate"] },
                    { $ne: ["$status", "delivered"] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get today's orders
    const todayOrders = await Order.countDocuments({
      ...baseFilters,
      createdAt: { $gte: today }
    });

    // Get this month's orders
    const monthOrders = await Order.countDocuments({
      ...baseFilters,
      createdAt: { $gte: thisMonth }
    });

    // Get last month's orders for comparison
    const lastMonthOrders = await Order.countDocuments({
      ...baseFilters,
      createdAt: { $gte: lastMonth, $lt: thisMonth }
    });

    // Calculate month-over-month growth
    const monthGrowth = lastMonthOrders > 0 
      ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;

    // Get user statistics (admin only)
    let userStats = {};
    if (role === "admin") {
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalOfficers = await User.countDocuments({ role: "officer", isActive: true });
      const totalRMOs = await User.countDocuments({ role: "rmo", isActive: true });
      
      userStats = { totalUsers, totalOfficers, totalRMOs };
    }

    // Get customer statistics
    const customerStats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: { $sum: { $cond: ["$isActive", 1, 0] } },
          newCustomers: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", thisMonth] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get nameplate statistics
    const nameplateStats = await Nameplate.aggregate([
      {
        $group: {
          _id: null,
          totalNameplates: { $sum: 1 },
          pendingNameplates: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          approvedNameplates: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          inProductionNameplates: {
            $sum: { $cond: [{ $eq: ["$status", "in_production"] }, 1, 0] }
          }
        }
      }
    ]);

    // Get priority-based statistics
    const priorityStats = await Order.aggregate([
      { $match: baseFilters },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format priority stats
    const priorityBreakdown = {
      low: priorityStats.find(p => p._id === "low")?.count || 0,
      medium: priorityStats.find(p => p._id === "medium")?.count || 0,
      high: priorityStats.find(p => p._id === "high")?.count || 0,
      urgent: priorityStats.find(p => p._id === "urgent")?.count || 0
    };

    // Get recent activity
    const recentOrders = await Order.find(baseFilters)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'name company')
      .populate('officerId', 'officerName')
      .select('orderNumber status createdAt customerId officerId');

    // Calculate performance metrics
    const performanceMetrics = {
      orderCompletionRate: ordersStats[0]?.totalOrders > 0 
        ? Math.round((ordersStats[0].completedOrders / ordersStats[0].totalOrders) * 100)
        : 0,
      averageOrderValue: ordersStats[0]?.totalOrders > 0
        ? Math.round(ordersStats[0].totalRevenue / ordersStats[0].totalOrders)
        : 0,
      monthOverMonthGrowth: Math.round(monthGrowth * 100) / 100
    };

    const stats = {
      orders: {
        total: ordersStats[0]?.totalOrders || 0,
        pending: ordersStats[0]?.pendingOrders || 0,
        inProduction: ordersStats[0]?.inProductionOrders || 0,
        completed: ordersStats[0]?.completedOrders || 0,
        overdue: ordersStats[0]?.overdueOrders || 0,
        today: todayOrders,
        thisMonth: monthOrders,
        monthGrowth: monthGrowth
      },
      revenue: {
        total: ordersStats[0]?.totalRevenue || 0,
        thisMonth: 0, // Calculate if needed
        monthGrowth: 0
      },
      customers: {
        total: customerStats[0]?.totalCustomers || 0,
        active: customerStats[0]?.activeCustomers || 0,
        newThisMonth: customerStats[0]?.newCustomers || 0
      },
      nameplates: {
        total: nameplateStats[0]?.totalNameplates || 0,
        pending: nameplateStats[0]?.pendingNameplates || 0,
        approved: nameplateStats[0]?.approvedNameplates || 0,
        inProduction: nameplateStats[0]?.inProductionNameplates || 0
      },
      priority: priorityBreakdown,
      performance: performanceMetrics,
      recentActivity: recentOrders,
      ...userStats
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
} 
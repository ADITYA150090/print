"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

// Types
interface Lot {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  rmo?: string;
  officerNumber?: string;
  officerName?: string;
  email?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  user?: User;
  lots?: Lot[];
  message?: string;
  error?: string;
}

// ✅ Custom hook for API calls with error handling
const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(
    async <T,>(url: string, options?: RequestInit): Promise<ApiResponse<T> | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse<T> = await response.json();

        if (!data.success && data.error) {
          throw new Error(data.error);
        }

        return data;
      } catch (err: any) {
        const errorMessage = err.message || "An unexpected error occurred";
        console.error(`API Error [${url}]:`, err);
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 👇 Add clearError function
  const clearError = () => setError(null);

  return { apiCall, loading, error, clearError };
};

export default function LotsPage() {
  // State management
  const [lots, setLots] = useState<Lot[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [createLotLoading, setCreateLotLoading] = useState(false);

  // Hooks
  const router = useRouter();
  const { officer } = useParams();
  const { apiCall, loading: apiLoading, error: apiError, clearError } = useApiCall();

  // Validate officer parameter
  const officerParam = Array.isArray(officer) ? officer[0] : officer;
  const isValidOfficer = officerParam && typeof officerParam === "string" && officerParam.trim().length > 0;

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    const response = await apiCall<User>("/api/auth/me");
    if (response?.success && response.user) {
      setUser(response.user);
      return response.user;
    }
    return null;
  }, [apiCall]);

  // Fetch lots data
  const fetchLots = useCallback(
    async (rmo: string, officerNumber: string) => {
      if (!rmo || !officerNumber) {
        console.warn("Missing required parameters for fetching lots:", { rmo, officerNumber });
        return;
      }

      const apiOfficer = officerNumber.toUpperCase();
      const url = `/api/rmo/${encodeURIComponent(rmo)}/officers/${encodeURIComponent(apiOfficer)}/lots`;

      console.log("Fetching lots from:", url);

      const response = await apiCall<{ lots: Lot[] }>(url);
      if (response?.success && response.lots) {
        // Remove duplicates and sort by ID
        const uniqueLotsMap = new Map<string, Lot>();
        response.lots.forEach((lot: Lot) => {
          if (lot.id && !uniqueLotsMap.has(lot.id)) {
            uniqueLotsMap.set(lot.id, lot);
          }
        });

        const uniqueLots = Array.from(uniqueLotsMap.values()).sort((a, b) =>
          a.id.localeCompare(b.id, undefined, { numeric: true })
        );

        console.log("Fetched lots:", uniqueLots);
        setLots(uniqueLots);
      } else {
        console.warn("No lots data in response:", response);
        setLots([]);
      }
    },
    [apiCall]
  );

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (!isValidOfficer) {
        console.error("Invalid officer parameter:", officer);
        setInitialLoading(false);
        return;
      }

      try {
        const userData = await fetchUserData();
        if (userData?.rmo && officerParam) {
          await fetchLots(userData.rmo, officerParam);
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeData();
  }, [officer, officerParam, isValidOfficer, fetchUserData, fetchLots]);

  // Create new lot
  const handleCreateLot = async () => {
    if (!user?.rmo || !officerParam) {
      alert("Missing required user data. Please try refreshing the page.");
      return;
    }

    setCreateLotLoading(true);

    try {
      // Generate a unique lot ID
      const existingIds = lots.map((lot) => {
        const match = lot.id.match(/(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });

      const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
      const newLotId = `Lot_${nextNumber}`;
      const newLotName = `Lot ${nextNumber}`;

      // Optimistically add to UI
      const newLot: Lot = {
        id: newLotId,
        name: newLotName,
        createdAt: new Date().toISOString(),
      };

      setLots((prev) =>
        [...prev, newLot].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
      );

      console.log("Created new lot:", newLot);
    } catch (error) {
      console.error("Error creating lot:", error);
      alert("Failed to create lot. Please try again.");
    } finally {
      setCreateLotLoading(false);
    }
  };

  // Navigate to lot page
  const handleLotClick = (lotId: string) => {
    if (!lotId) {
      console.error("Invalid lot ID");
      return;
    }

    const targetUrl = `/${encodeURIComponent(officerParam!)}/lots/${encodeURIComponent(lotId)}`;
    console.log("Navigating to:", targetUrl);
    router.push(targetUrl);
  };

  // Retry failed operations
  const handleRetry = async () => {
    clearError();
    if (user?.rmo && officerParam) {
      await fetchLots(user.rmo, officerParam);
    } else {
      await fetchUserData();
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lots data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!isValidOfficer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Officer</h1>
          <p className="text-gray-600 mb-4">The officer parameter "{officer}" is not valid.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-black relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lots for Officer: {officerParam}</h1>
          {user?.rmo && <p className="text-sm text-gray-600 mt-1">RMO: {user.rmo}</p>}
        </div>

        <button
          onClick={handleCreateLot}
          disabled={createLotLoading || apiLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg shadow-md transition-colors"
        >
          {createLotLoading ? "Creating..." : "+ Create Lot"}
        </button>
      </div>

      {/* Error Display */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
              <p className="text-red-700 text-sm mt-1">{apiError}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                disabled={apiLoading}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                {apiLoading ? "Retrying..." : "Retry"}
              </button>
              <button onClick={clearError} className="text-red-600 hover:text-red-800 text-sm">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {apiLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      {/* Lots Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {lots.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Lots Available</h3>
            <p className="text-gray-500 mb-6">
              {apiError
                ? "There was an error loading lots. Please try again."
                : "Create your first lot to get started."}
            </p>
            {!apiError && (
              <button
                onClick={handleCreateLot}
                disabled={createLotLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
              >
                {createLotLoading ? "Creating..." : "Create First Lot"}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Available Lots ({lots.length})
              </h2>
              <div className="text-sm text-gray-500">Click on a lot to view details</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  onClick={() => handleLotClick(lot.id)}
                  className="bg-gray-50 hover:bg-blue-50 p-6 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                      {lot.id}
                    </h3>
                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{lot.name}</p>

                  {lot.createdAt && (
                    <p className="text-xs text-gray-400">
                      Created: {new Date(lot.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded max-w-sm">
          <div className="font-semibold mb-1">Debug Info:</div>
          <div>Officer: {officerParam || "N/A"}</div>
          <div>RMO: {user?.rmo || "N/A"}</div>
          <div>Lots Count: {lots.length}</div>
          <div>Loading: {apiLoading ? "Yes" : "No"}</div>
          <div>Error: {apiError ? "Yes" : "No"}</div>
        </div>
      )}
    </div>
  );
}

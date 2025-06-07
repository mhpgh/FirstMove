import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, ChevronLeft, ChevronRight, Calendar, Check, Home, BarChart3, Settings, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { User } from "@/lib/auth";

interface Partner {
  id: number;
  username: string;
  displayName: string;
  keepTrack: boolean;
  createdAt: string;
}

interface Couple {
  id: number;
  user1Id: number;
  user2Id: number;
  isActive: boolean;
  createdAt: string;
}

interface CoupleData {
  couple: Couple;
  partner: Partner;
}

interface Match {
  id: number;
  coupleId: number;
  moodType: string;
  matchedAt: string;
  acknowledged: boolean;
  connected: boolean;
  connectedAt: string | null;
  recorded: boolean;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  hasConnection: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

interface InsightsPageProps {
  user: User;
  onBack: () => void;
  onShowSettings: () => void;
}

export default function InsightsPage({ user, onBack, onShowSettings }: InsightsPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch current user data to get latest keepTrack state
  const { data: currentUserData } = useQuery<{ user: User }>({
    queryKey: [`/api/user/${user.id}`],
  });

  // Fetch couple data
  const { data: coupleData } = useQuery<CoupleData>({
    queryKey: [`/api/user/${user.id}/couple`],
    retry: false,
  });

  // Fetch recent matches
  const { data: matchesData } = useQuery<{ matches: Match[] }>({
    queryKey: [`/api/couple/${coupleData?.couple.id}/matches`],
    enabled: !!coupleData?.couple.id,
  });

  // Derive current user tracking state from server data
  const currentUser = currentUserData?.user || user;

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get connection dates from matches
  const getConnectionDates = () => {
    if (!matchesData?.matches) return new Set();
    
    return new Set(
      matchesData.matches
        .filter(match => match.connected && match.recorded && match.connectedAt)
        .map(match => {
          const date = new Date(match.connectedAt!);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        })
    );
  };

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const connectionDates = getConnectionDates();
    
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      
      const dateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const hasConnection = connectionDates.has(dateString);
      const isCurrentMonth = day.getMonth() === month;
      const isToday = day.toDateString() === new Date().toDateString();
      
      days.push({
        date: day,
        dateString,
        hasConnection,
        isCurrentMonth,
        isToday,
        dayNumber: day.getDate()
      });
    }
    
    return days;
  };

  // Get statistics
  const getStats = () => {
    if (!matchesData?.matches) return { totalConnections: 0, thisMonth: 0 };
    
    const connections = matchesData.matches.filter(match => match.connected && match.recorded && match.connectedAt);
    const thisMonth = connections.filter(match => {
      const connectionDate = new Date(match.connectedAt!);
      return connectionDate.getMonth() === new Date().getMonth() && 
             connectionDate.getFullYear() === new Date().getFullYear();
    });

    return {
      totalConnections: connections.length,
      thisMonth: thisMonth.length
    };
  };

  const calendarDays = generateCalendarDays();
  const stats = getStats();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="header" />
            <span className="text-xl font-semibold text-gray-800">FirstMove</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 p-4 max-w-md mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Insights</h1>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalConnections}</div>
              <div className="text-sm text-gray-500">Total Connections</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.thisMonth}</div>
              <div className="text-sm text-gray-500">This Month</div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-lg font-semibold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="h-8 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500">{day}</span>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`h-10 flex items-center justify-center relative ${
                    !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'
                  } ${
                    day.isToday ? 'bg-blue-100 rounded-lg' : ''
                  }`}
                >
                  <span className="text-sm">{day.dayNumber}</span>
                  {day.hasConnection && day.isCurrentMonth && (
                    <div className="absolute inset-0 bg-green-100 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connection recorded</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection History List */}
        {currentUser.keepTrack && coupleData?.partner?.keepTrack && (
          <Card className="rounded-2xl shadow-sm mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection History</h3>
              {matchesData?.matches && matchesData.matches.filter(match => match.recorded && match.connectedAt).length > 0 ? (
                <div className="space-y-3">
                  {matchesData.matches
                    .filter(match => match.recorded && match.connectedAt)
                    .sort((a, b) => new Date(b.connectedAt!).getTime() - new Date(a.connectedAt!).getTime())
                    .map((match, index) => {
                      const connectionDate = new Date(match.connectedAt!);
                      const isToday = connectionDate.toDateString() === new Date().toDateString();
                      const isYesterday = connectionDate.toDateString() === new Date(Date.now() - 86400000).toDateString();
                      
                      let dateLabel;
                      if (isToday) {
                        dateLabel = 'Today';
                      } else if (isYesterday) {
                        dateLabel = 'Yesterday';
                      } else {
                        dateLabel = connectionDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        });
                      }
                      
                      const timeLabel = connectionDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });

                      return (
                        <div key={match.id} className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-800">{dateLabel}</p>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-500">{timeLabel}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">No connections recorded yet</p>
                  <p className="text-xs text-gray-400">Your connection history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Information */}
        {!currentUser.keepTrack && (
          <Card className="rounded-2xl shadow-sm border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Enable "Keep Track" to see your connection history
                  </p>
                  <p className="text-xs text-blue-600">
                    Go to Settings to turn on connection tracking. Both you and your partner need to enable this feature to record connections.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentUser.keepTrack && coupleData?.partner && !coupleData.partner.keepTrack && (
          <Card className="rounded-2xl shadow-sm border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-800 font-medium mb-1">
                    Partner tracking disabled
                  </p>
                  <p className="text-xs text-amber-600">
                    {coupleData.partner.displayName} has not enabled "Keep Track" in their Settings. Both partners must enable tracking for connections to be recorded.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <button 
              onClick={onBack}
              className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-primary"
            >
              <Home className="text-lg mb-1" />
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center py-2 px-3 text-primary">
              <BarChart3 className="text-lg mb-1" />
              <span className="text-xs">Insights</span>
            </button>
            <button 
              onClick={onShowSettings}
              className="flex flex-col items-center py-2 px-3 text-gray-400 hover:text-primary"
            >
              <Settings className="text-lg mb-1" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
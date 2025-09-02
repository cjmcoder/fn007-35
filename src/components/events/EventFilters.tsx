import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Gamepad2,
  Monitor,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const gameOptions = [
  'Madden NFL 25',
  'Arena Warriors',
  'Speed Trials',
  'UFC 5',
  'FIFA 24',
  'NBA 2K25',
  'NHL 24'
];

const platformOptions = ['PS5', 'Xbox', 'PC', 'Mobile'];
const formatOptions = ['1v1', 'Bracket', 'Swiss', 'Leaderboard'];
const statusOptions = ['Open', 'Live', 'Full', 'Completed'];

export function EventFilters() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Open']);
  const [entryRange, setEntryRange] = useState([0, 1000]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const toggleFilter = (value: string, selected: string[], setter: (values: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(v => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedGames([]);
    setSelectedPlatforms([]);
    setSelectedFormats([]);
    setSelectedStatuses(['Open']);
    setEntryRange([0, 1000]);
    setDateRange({});
  };

  const hasActiveFilters = () => {
    return selectedGames.length > 0 || 
           selectedPlatforms.length > 0 || 
           selectedFormats.length > 0 || 
           selectedStatuses.length !== 1 || 
           selectedStatuses[0] !== 'Open' ||
           entryRange[0] > 0 || 
           entryRange[1] < 1000 ||
           dateRange.from || 
           dateRange.to;
  };

  return (
    <Card className="glass-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </div>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Games */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">Games</label>
              </div>
              <div className="flex flex-wrap gap-1">
                {gameOptions.map((game) => (
                  <Button
                    key={game}
                    variant={selectedGames.includes(game) ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "text-xs h-7",
                      selectedGames.includes(game) && "bg-primary/20 text-primary border-primary/30"
                    )}
                    onClick={() => toggleFilter(game, selectedGames, setSelectedGames)}
                  >
                    {game}
                  </Button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">Platform</label>
              </div>
              <div className="flex flex-wrap gap-1">
                {platformOptions.map((platform) => (
                  <Button
                    key={platform}
                    variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "text-xs h-7",
                      selectedPlatforms.includes(platform) && "bg-primary/20 text-primary border-primary/30"
                    )}
                    onClick={() => toggleFilter(platform, selectedPlatforms, setSelectedPlatforms)}
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>

            {/* Entry Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">Entry Range (FC)</label>
              </div>
              <div className="px-2">
                <Slider
                  value={entryRange}
                  onValueChange={setEntryRange}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{entryRange[0]} FC</span>
                  <span>{entryRange[1]} FC</span>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">Date Range</label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left">
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      "Select dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                    onSelect={(range) => setDateRange(range || {})}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

          </div>

          {/* Format & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            
            {/* Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <div className="flex flex-wrap gap-1">
                {formatOptions.map((format) => (
                  <Button
                    key={format}
                    variant={selectedFormats.includes(format) ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "text-xs h-7",
                      selectedFormats.includes(format) && "bg-primary/20 text-primary border-primary/30"
                    )}
                    onClick={() => toggleFilter(format, selectedFormats, setSelectedFormats)}
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-1">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatuses.includes(status) ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "text-xs h-7",
                      selectedStatuses.includes(status) && "bg-primary/20 text-primary border-primary/30"
                    )}
                    onClick={() => toggleFilter(status, selectedStatuses, setSelectedStatuses)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

          </div>

          {/* Clear Filters */}
          {hasActiveFilters() && (
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}

        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
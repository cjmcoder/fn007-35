import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, X } from "lucide-react";
import { useUI } from "@/store/useUI";
import { Platform, GameTitle, Rank } from "@/lib/types";

export const FiltersBar = () => {
  const { filters, updateFilters, resetFilters } = useUI();
  
  const hasActiveFilters = 
    filters.platform !== 'All' || 
    filters.game !== 'All' || 
    filters.rank !== 'All' || 
    filters.search !== '';

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex flex-wrap items-center gap-4">
        {/* Platform Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-neon-cyan" />
          <Select 
            value={filters.platform} 
            onValueChange={(value) => updateFilters({ platform: value as Platform | 'All' })}
          >
            <SelectTrigger className="w-40 bg-muted/50 border-border focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="All">All Platforms</SelectItem>
              <SelectItem value="PS5">PS5</SelectItem>
              <SelectItem value="Xbox">Xbox</SelectItem>
              <SelectItem value="PC">PC</SelectItem>
              <SelectItem value="Switch">Switch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Game Filter */}
        <Select 
          value={filters.game} 
          onValueChange={(value) => updateFilters({ game: value as GameTitle | 'All' })}
        >
          <SelectTrigger className="w-48 bg-muted/50 border-border focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="All">All Games</SelectItem>
            <SelectItem value="Madden">Madden NFL 25</SelectItem>
            <SelectItem value="UFC">UFC 5</SelectItem>
            <SelectItem value="FIFA">FIFA 24</SelectItem>
            <SelectItem value="NHL">NHL 24</SelectItem>
            <SelectItem value="NBA">NBA 2K</SelectItem>
            <SelectItem value="MLB">MLB The Show</SelectItem>
            <SelectItem value="UNDISPUTED">UNDISPUTED</SelectItem>
            <SelectItem value="F1">F1</SelectItem>
            <SelectItem value="TENNIS">Tennis</SelectItem>
            <SelectItem value="CustomUnity">Unity Games</SelectItem>
          </SelectContent>
        </Select>

        {/* Prize Sort */}
        <Select 
          value={filters.prizeSort} 
          onValueChange={(value) => updateFilters({ prizeSort: value as 'high-to-low' | 'low-to-high' })}
        >
          <SelectTrigger className="w-40 bg-muted/50 border-border focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="high-to-low">Prize: High to Low</SelectItem>
            <SelectItem value="low-to-high">Prize: Low to High</SelectItem>
          </SelectContent>
        </Select>

        {/* Rank Filter */}
        <Select 
          value={filters.rank} 
          onValueChange={(value) => updateFilters({ rank: value as Rank })}
        >
          <SelectTrigger className="w-32 bg-muted/50 border-border focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="All">All Ranks</SelectItem>
            <SelectItem value="Rookie">Rookie</SelectItem>
            <SelectItem value="Pro">Pro</SelectItem>
            <SelectItem value="Elite">Elite</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search challenges..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-muted/50 border-border focus:border-primary"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex items-center space-x-2 ml-auto">
          <Badge variant="outline" className="border-neon-cyan text-neon-cyan cursor-pointer hover:bg-neon-cyan/10">
            Stream Required
          </Badge>
          <Badge variant="outline" className="border-neon-purple text-neon-purple cursor-pointer hover:bg-neon-purple/10">
            Quick Match
          </Badge>
        </div>
      </div>
    </div>
  );
};
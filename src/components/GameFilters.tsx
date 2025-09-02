import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus, Gamepad2, Monitor, Smartphone } from "lucide-react";

const GameFilters = () => {
  return (
    <div className="w-full glass-card p-6 rounded-xl">
      <div className="flex flex-wrap items-center gap-4">
        {/* Platform Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-neon-cyan" />
          <Select defaultValue="all-platforms">
            <SelectTrigger className="w-40 bg-muted/50 border-border focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all-platforms">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>All Platforms</span>
                </div>
              </SelectItem>
              <SelectItem value="pc">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4" />
                  <span>PC</span>
                </div>
              </SelectItem>
              <SelectItem value="ps5">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>PS5</span>
                </div>
              </SelectItem>
              <SelectItem value="xbox">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Xbox</span>
                </div>
              </SelectItem>
              <SelectItem value="mobile">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Game Filter */}
        <Select defaultValue="all-games">
          <SelectTrigger className="w-48 bg-muted/50 border-border focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all-games">All Games</SelectItem>
            <SelectItem value="madden-25">Madden NFL 25</SelectItem>
            <SelectItem value="fifa-24">FIFA 24</SelectItem>
            <SelectItem value="cod-mw3">Call of Duty: MW3</SelectItem>
            <SelectItem value="fortnite">Fortnite</SelectItem>
            <SelectItem value="apex">Apex Legends</SelectItem>
            <SelectItem value="valorant">Valorant</SelectItem>
          </SelectContent>
        </Select>

        {/* Prize Filter */}
        <Select defaultValue="high-to-low">
          <SelectTrigger className="w-40 bg-muted/50 border-border focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="high-to-low">Prize: High to Low</SelectItem>
            <SelectItem value="low-to-high">Prize: Low to High</SelectItem>
            <SelectItem value="under-25">Under $25</SelectItem>
            <SelectItem value="25-50">$25 - $50</SelectItem>
            <SelectItem value="over-50">Over $50</SelectItem>
          </SelectContent>
        </Select>

        {/* Rank Filter */}
        <Select defaultValue="all-ranks">
          <SelectTrigger className="w-32 bg-muted/50 border-border focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all-ranks">All Ranks</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filters */}
        <div className="flex items-center space-x-2 ml-auto">
          <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
            Online Players
          </Badge>
          <Badge variant="outline" className="border-neon-purple text-neon-purple">
            Quick Match
          </Badge>
        </div>

        {/* Create Challenge Button */}
        <Button className="bg-gradient-secondary hover:shadow-orange px-6">
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </div>
    </div>
  );
};

export default GameFilters;
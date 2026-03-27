import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AVAILABLE_FACILITIES } from "@/components/creation/GeneralFacilitiesSelector";

const ITEMS_PER_PAGE = 10;

interface GeneralFacilitiesDisplayProps {
  facilityIds: string[];
}

export const GeneralFacilitiesDisplay = ({ facilityIds }: GeneralFacilitiesDisplayProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  if (!facilityIds || facilityIds.length === 0) return null;

  const facilities = facilityIds
    .map(id => AVAILABLE_FACILITIES.find(f => f.id === id))
    .filter(Boolean);

  if (facilities.length === 0) return null;

  const totalPages = Math.ceil(facilities.length / ITEMS_PER_PAGE);
  const displayedFacilities = showAll
    ? facilities
    : facilities.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <section className="bg-background rounded-3xl p-4 md:p-6 shadow-sm border border-border">
      <h2 className="text-[11px] font-black uppercase tracking-widest mb-3 md:mb-4 text-muted-foreground">General Facilities</h2>
      <div className="flex flex-wrap gap-3 md:gap-4">
        {displayedFacilities.map((facility) => {
          if (!facility) return null;
          const Icon = facility.icon;
          return (
            <div
              key={facility.id}
              className="flex flex-col items-center gap-1 w-14 md:w-16"
            >
              <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="text-[8px] md:text-[10px] font-medium text-muted-foreground text-center leading-tight">{facility.label}</span>
            </div>
          );
        })}
      </div>

      {facilities.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {!showAll && totalPages > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground font-bold">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowAll(!showAll); setCurrentPage(1); }}
            className="text-xs font-bold h-8"
          >
            {showAll ? "Show Less" : `View All (${facilities.length})`}
          </Button>
        </div>
      )}
    </section>
  );
};

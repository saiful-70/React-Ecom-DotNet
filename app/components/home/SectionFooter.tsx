"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useTranslation } from "react-i18next";

interface SectionFooterProps {
  viewAllHref: string;
}

export function SectionFooter({
  viewAllHref,
}: SectionFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center mt-6 sm:mt-8">
      <Link href={viewAllHref}>
        <Button variant="outline" className="group hover:border-2 hover:border-primary">
          {t("products.viewAll")}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Button>
      </Link>
    </div>
  );
}

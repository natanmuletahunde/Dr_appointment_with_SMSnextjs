import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DoctorProfile } from "@/types/domain";

type DoctorCardProps = {
  doctor: DoctorProfile;
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="overflow-hidden transition-colors hover:border-green-500/40">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-dark-500 bg-dark-300">
          <Image
            src={doctor.imageUrl || "/assets/images/dr-green.png"}
            alt={doctor.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="truncate">
              <Link
                href={`/admin/doctors/${doctor.$id}`}
                className="hover:text-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                Dr. {doctor.name}
              </Link>
            </CardTitle>
            {doctor.isActive ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
          <CardDescription>{doctor.specialty}</CardDescription>
          <p className="flex items-center gap-1 text-12-regular text-dark-700">
            <Star className="size-3.5 fill-green-500 text-green-500" aria-hidden />
            {doctor.averageRating.toFixed(1)} ({doctor.reviewCount} reviews)
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-14-regular text-dark-700">
        <p className="line-clamp-2">{doctor.bio}</p>
        <div className="flex flex-wrap gap-2">
          {doctor.languages.map((lang) => (
            <Badge key={lang} variant="outline">
              {lang}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-12-regular text-dark-600">
          <span>
            {doctor.startTime} – {doctor.endTime} · {doctor.slotMinutes}m slots
          </span>
          <span>
            {doctor.acceptingNewPatients
              ? "Accepting patients"
              : "Not accepting"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

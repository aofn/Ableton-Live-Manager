"use client";

import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { AccordionHeader } from "@radix-ui/react-accordion";

const TrackDetails = ({ label, tracks }) => {
  const { t } = useTranslation();

  // Handle cases where tracks might be undefined
  if (!tracks) {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <AccordionHeader>{t(label) + ": 0"}</AccordionHeader>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">No tracks found</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  // Convert single track object to array if necessary
  const tracksArray = Array.isArray(tracks) ? tracks : [tracks];

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <AccordionHeader>
            {t(label) + ": " + tracksArray.length}
          </AccordionHeader>
        </AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableBody>
              {tracksArray.map((track, index) => {
                // Safely access nested properties
                const trackName =
                  track?.Name?.EffectiveName?.Value || `Track ${index + 1}`;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{trackName}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default TrackDetails;

"use client";

import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardDescription } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-menubar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { AccordionHeader } from "@radix-ui/react-accordion";

const TrackDetails = ({ label, tracks }) => {
  const { t } = useTranslation();
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <AccordionHeader>{t(label) + ": " + tracks.length}</AccordionHeader>
        </AccordionTrigger>
        <AccordionContent>
          <Table>
            <TableBody>
              {tracks.map((track, index) => {
                // console.log(track.DeviceChain.DeviceChain.Devices)
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {" "}
                      {track.Name.EffectiveName.Value}
                    </TableCell>
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

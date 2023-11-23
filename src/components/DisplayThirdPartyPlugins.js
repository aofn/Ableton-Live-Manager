"use client";

import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

const DisplayThirdPartyPlugins = ({ thirdPartyPlugins, removePlugins }) => {
  const [pluginsToRemove, setPluginsToRemove] = useState([]);
  const [userFeedback, setUserFeedback] = useState("");
  const [isRemovingPlugins, setIsRemovingPlugins] = useState(false);
  const { t } = useTranslation();

  const handleChange = (index, checked) => {
    setPluginsToRemove((prevState) => {
      if (checked) return [...prevState, thirdPartyPlugins[index].name];
      else {
        return prevState.filter(
          (plugin) => plugin !== thirdPartyPlugins[index].name,
        );
      }
    });
  };

  const handleRemovePlugins = async () => {
    setIsRemovingPlugins(true);
    await removePlugins(pluginsToRemove).catch((error) => {
      console.log(error);
      setUserFeedback(t("Error removing plugins. Please try again."));
      setIsRemovingPlugins(false);
    });
    setUserFeedback(t("Plugins removed successfully."));
    setIsRemovingPlugins(false);
  };
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("Name")}</TableHead>
            <TableHead></TableHead>
            <TableHead className="text-right">{t("Type")}</TableHead>
            <TableHead className="text-right">{t("Remove")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {thirdPartyPlugins.map((plugin, index) => {
            if (!plugin) return;
            return (
              <PluginRow
                key={index}
                index={index}
                plugin={plugin}
                callback={handleChange}
              />
            );
          })}
        </TableBody>
      </Table>
      <div className="flex justify-end items-end h-full">
        <Dialog>
          <DialogTrigger>
            <Button variant="default" disabled={pluginsToRemove.length === 0}>
              {t("Remove")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            {userFeedback ? (
              <DialogHeader>{userFeedback}</DialogHeader>
            ) : (
              <>
                <DialogHeader>{t("Remove Plugins")}</DialogHeader>
                <DialogDescription>
                  {t(
                    "You are about to create a copy of your project. Your original project will not be modified. The following plugins will be removed:",
                  )}
                </DialogDescription>

                <Table>
                  <TableBody>
                    {pluginsToRemove.map((plugin, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {plugin}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <Button
                  variant="destructive"
                  onClick={handleRemovePlugins}
                  disabled={isRemovingPlugins}
                >
                  {t("Remove")}
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default DisplayThirdPartyPlugins;

const PluginRow = ({ index, plugin, callback }) => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked((prevState) => {
      return !prevState;
    });
    callback(index, !checked);
  };
  return (
    <TableRow key={index}>
      <TableCell className="font-medium">{plugin.name}</TableCell>
      <TableCell>{plugin.manufacturer}</TableCell>
      <TableCell className="text-right">{plugin.type}</TableCell>
      <TableCell className="text-right">
        <Checkbox checked={checked} onCheckedChange={handleChange} />
      </TableCell>
    </TableRow>
  );
};

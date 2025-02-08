"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import _ from "lodash";
import { findDeep } from "@/utils";
import { readBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
import Ableton from "@/lib/Ableton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrackDetails from "@/components/TrackDetails";
import { Skeleton } from "@/components/ui/skeleton";
import DisplayThirdPartyPlugins from "@/components/DisplayThirdPartyPlugins";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const AlsInfo = ({
  path,
  projectDirectory,
  onClose,
  almFile,
  name,
  setAlmFile,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [projectObject, setProjectObject] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [, setAllPlugins] = useState([]);
  const [auPlugins, setAuPlugins] = useState([]);
  const [vstPlugins, setVstPlugins] = useState([]);
  const [vst3Plugins, setVst3Plugins] = useState([]);
  const [original, setOriginal] = useState([]);

  useEffect(() => {
    const writeAlmFile = async () => {
      const newFile = Object.assign({}, almFile, {
        [name]: {
          bpm: projectObject.Ableton.LiveSet.MasterTrack.DeviceChain.Mixer.Tempo
            .Manual.Value,
        },
      });

      // if there weren't any changes we want to return out of the function
      if (almFile === newFile) return;
      // otherwise we save the changes
      setAlmFile(newFile);
      return await writeTextFile(
        `${projectDirectory}/alm.json`,
        JSON.stringify(newFile, null, 2),
      );
    };

    if (projectObject) writeAlmFile().catch((error) => console.log(error));
    // eslint-disable-next-line
  }, [path, projectDirectory, projectObject]);

  useEffect(() => {
    const getThirdPartyPlugins = (project) => {
      function sortPlugins(obj) {
        setAllPlugins((prevState) => [...prevState, obj[Object.keys(obj)[0]]]); // return the first key of the object

        if (obj.AuPluginInfo) {
          // console.log(device.PluginDesc.AuPluginInfo.Name.Value)
          setAuPlugins((prevState) => {
            const name = obj.AuPluginInfo.Name?.Value;
            if (prevState.some((plugin) => plugin.name === name))
              return prevState;

            return [
              ...prevState,
              {
                manufacturer: obj.AuPluginInfo.Manufacturer?.Value,
                name: obj.AuPluginInfo.Name?.Value,
                type: "AU",
              },
            ];
          });
        } else if (obj.VstPluginInfo) {
          setVstPlugins((prevState) => {
            const name =
              obj.VstPluginInfo.Name?.Value ||
              obj.VstPluginInfo.PlugName?.Value;
            if (prevState.some((plugin) => plugin.name === name))
              return prevState;

            return [
              ...prevState,
              {
                manufacturer: obj.VstPluginInfo?.Manufacturer?.Value,
                name:
                  obj.VstPluginInfo.Name?.Value ||
                  obj.VstPluginInfo.PlugName?.Value,
                type: "VST",
              },
            ];
          });
        } else if (obj.Vst3PluginInfo) {
          // console.log(device.PluginDesc.Vst3PluginInfo.Name.Value)
          setVst3Plugins((prevState) => {
            const name = obj.Vst3PluginInfo.Name?.Value;
            if (prevState.some((plugin) => plugin.name === name))
              return prevState;
            return [
              ...prevState,
              {
                manufacturer: obj.Vst3PluginInfo.Manufacturer?.Value,
                name: name,
                type: "VST3",
              },
            ];
          });
        } else console.log(obj);
      }

      _.map(project, (tracks) => {
        findDeep(tracks, "PluginDesc", sortPlugins);
      });
      setLoading(false);
    };

    const readProjectFile = async (file) => {
      // rest project file to display loading view
      setProjectObject(null);
      const zipFileContent = await readBinaryFile(file);
      new Ableton().UnpackAndCreatJson(
        zipFileContent,
        (AbletonSet) => {
          setProjectObject(AbletonSet);
          getThirdPartyPlugins(AbletonSet.Ableton.LiveSet.Tracks);
        },
        (error) => {
          setErrorMessage(error);
          setLoading(false);
        },
        (result) => setOriginal(result),
      );
    };

    if (path) readProjectFile(path);
  }, [path]);

  const removePlugins = async (pluginsToRemove) => {
    const xml = Ableton.RemoveDevices(original, pluginsToRemove);
    const lastSlash = path.lastIndexOf("/");
    const lastDot = path.lastIndexOf(".als");
    const projectName = path.substring(lastSlash + 1, lastDot);
    await writeTextFile(
      `${projectDirectory}/${projectName}_plugins-removed.als`,
      xml,
    );
  };
  if (!projectObject && errorMessage) return errorMessage;

  return (
    <Tabs defaultValue="project" className="h-full w-full flex flex-col">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TabsList className="w-full justify-start h-12 px-4 border-b rounded-none">
          <TabsTrigger
            disabled={!projectObject}
            value="project"
            className="data-[state=active]:bg-background"
          >
            {t("Project Details")}
          </TabsTrigger>
          <TabsTrigger
            disabled={!projectObject}
            value="thirdPartyPlugins"
            className="data-[state=active]:bg-background"
          >
            {t("Third Party Plugins")}
          </TabsTrigger>
          <button
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
            onClick={onClose}
          >
            <Cross2Icon className="h-4 w-4" />
          </button>
        </TabsList>
      </div>
      <div className="flex-1 overflow-auto">
        {" "}
        {/* Added wrapper div with flex-1 and overflow-auto */}
        <TabsContent value="project" className="px-4 pb-4 h-full">
          {projectObject ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-md">
                    {projectObject.Ableton.LiveSet?.MasterTrack
                      ? projectObject.Ableton.LiveSet.MasterTrack.DeviceChain
                          .Mixer.Tempo.Manual.Value
                      : projectObject.Ableton.LiveSet.MainTrack.DeviceChain
                          .Mixer.Tempo.Manual.Value}
                    {" BPM"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {projectObject?.Ableton.Creator}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                <TrackDetails
                  label="Audio Tracks"
                  tracks={projectObject.Ableton.LiveSet.Tracks.AudioTrack}
                />
                <TrackDetails
                  label="Midi Tracks"
                  tracks={projectObject.Ableton.LiveSet.Tracks.MidiTrack}
                />
                <TrackDetails
                  label="Return Tracks"
                  tracks={projectObject.Ableton.LiveSet.Tracks.ReturnTrack}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[400px]" />
              <Skeleton className="h-8 w-[400px]" />
              <Skeleton className="h-8 w-[400px]" />
              <Skeleton className="h-8 w-[400px]" />
            </div>
          )}
        </TabsContent>
        <TabsContent value="thirdPartyPlugins" className="px-4 pb-4 h-full">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">
                Loading plugins...
              </p>
            </div>
          ) : (
            <DisplayThirdPartyPlugins
              thirdPartyPlugins={auPlugins.concat(vstPlugins, vst3Plugins)}
              removePlugins={removePlugins}
            />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AlsInfo;

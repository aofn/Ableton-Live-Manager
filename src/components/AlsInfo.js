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

/**
 * Displays the details of an Ableton project.
 * @param path - The path to the project file.
 * @param projectDirectory - The path to the project directory.
 * @param onClose - Callback function to close the modal.
 * @param almFile - The APM file associated with the project.
 * @param name - The name of the project.
 * @param setAlmFile - The setAlmFile setter function.
 * @returns {JSX.Element|string} - The JSX element representing the project details.
 */

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
  const [allPlugins, setAllPlugins] = useState([]);
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
    <Tabs defaultValue="project">
      <TabsList className="w-full justify-start">
        <TabsTrigger disabled={!projectObject} value="project">
          {t("Project Details")}
        </TabsTrigger>
        <TabsTrigger disabled={!projectObject} value="thirdPartyPlugins">
          {t("Third Party Plugins")}
        </TabsTrigger>
        <TabsTrigger
          className="ml-auto"
          onClick={() => onClose()}
          value="close"
        >
          <Cross2Icon />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="project">
        {projectObject ? (
          <>
            <p className="py-1">
              {t("BPM:")}
              <span className="px-1">
                {
                  projectObject.Ableton.LiveSet.MasterTrack.DeviceChain.Mixer
                    .Tempo.Manual.Value
                }
              </span>
            </p>
            <p className="py-1">{projectObject?.Ableton.Creator}</p>
            <Separator />
            <TrackDetails
              label={"Audio Tracks"}
              tracks={projectObject.Ableton.LiveSet.Tracks.AudioTrack}
            />
            <TrackDetails
              label={"Midi Tracks"}
              tracks={projectObject.Ableton.LiveSet.Tracks.MidiTrack}
            />
            <TrackDetails
              label={"Return Tracks"}
              tracks={projectObject.Ableton.LiveSet.Tracks.ReturnTrack}
            />
          </>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100]" />
            <Skeleton className="h-8 w-[400]" />
            <Skeleton className="h-8 w-[400]" />
            <Skeleton className="h-8 w-[400]" />
            <Skeleton className="h-8 w-[400]" />
          </div>
        )}
      </TabsContent>
      <TabsContent value="thirdPartyPlugins">
        {loading ? (
          "loading plugins"
        ) : (
          <DisplayThirdPartyPlugins
            thirdPartyPlugins={auPlugins.concat(vstPlugins, vst3Plugins)}
            removePlugins={removePlugins}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};
export default AlsInfo;

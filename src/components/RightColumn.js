import React from "react";
import AlsInfo from "@/components/AlsInfo";
import Notes from "@/components/Notes";

export const RightColumn = ({
  projectDirectory,
  name,
  openDetails,
  setOpenDetails,
  almFile,
  setAlmFile,
}) => {
  return (
    <div className="flex-1">
      <div
        className="overflow-y-auto px-4"
        style={{ maxHeight: "calc(100vh - 20rem)" }}
      >
        {openDetails ? (
          <AlsInfo
            path={openDetails}
            projectDirectory={projectDirectory}
            name={name}
            onClose={() => setOpenDetails(false)}
            almFile={almFile}
            setAlmFile={setAlmFile}
          />
        ) : (
          <Notes
            projectDirectory={projectDirectory}
            almFile={almFile}
            setAlmFile={setAlmFile}
          />
        )}
      </div>
    </div>
  );
};

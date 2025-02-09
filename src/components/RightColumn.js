import React from "react";
import AlsInfo from "@/components/AlsInfo";
import Notes from "@/components/Notes";

export const RightColumn = ({
  projectDirectory,
  name,
  openDetails,
  setOpenDetails,
  almFile,
}) => {
  return (
    <div className="flex-1">
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 20rem)" }}
      >
        {openDetails ? (
          <AlsInfo
            path={openDetails}
            projectDirectory={projectDirectory}
            name={name}
            onClose={() => setOpenDetails(false)}
            almFile={almFile}
          />
        ) : (
          <Notes projectDirectory={projectDirectory} notes={almFile?.notes} />
        )}
      </div>
    </div>
  );
};

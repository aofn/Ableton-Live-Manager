"use client";

import AlsInfo from "@/components/AlsInfo";
import Notes from "@/components/Notes";

/**
 * React component representing the right column in the expanded Accordion view.
 * This component either contains a note editor or a Tab view with details abput the project.
 * @param projectDirectory - The project directory.
 * @param projectNotesPath - The project notes path.
 * @param name - The name of the project.
 * @param openDetails - The openDetails state indicating whether notes or project details are visible.
 * @param setOpenDetails  - The setOpenDetails setter function.
 * @param almFile - The almFile object.
 * @param setAlmFile - The setAlmFile setter function.
 * @returns {JSX.Element} - The JSX element representing the right column.
 * @constructor
 */
export const RightColumn = ({
  projectDirectory,
  name,
  openDetails,
  setOpenDetails,
  almFile,
  setAlmFile,
}) => {
  return (
    <section className="min-h-[400px] h-full overflow-y-auto">
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
    </section>
  );
};

import { useRecipe } from "../context/RecipeContext";

function MultiStageLoader() {

  const { loadingStage } = useRecipe();

  const stages = [
    "Uploading image...",
    "Detecting ingredients...",
    "Preparing recipe prompt...",
    "Generating recipe with AI...",
    "Finalizing recipe...",
    "Generating recipe suggestions..."
  ];

  return (

    <div className="multi-loader">

      <h3>AI Kitchen Assistant</h3>

      {stages.map((stage,index)=>{

        const active =
          loadingStage === stage;

        const completed =
          stages.indexOf(loadingStage)
          > index;

        return(

          <div
            key={stage}
            className={`loader-step
              ${active ? "active" : ""}
              ${completed ? "done" : ""}
            `}
          >

            <span className="step-icon">

              {completed ? "✓" :
               active ? "⏳" :
               "○"}

            </span>

            {stage}

          </div>

        )

      })}

    </div>

  );
}

export default MultiStageLoader;
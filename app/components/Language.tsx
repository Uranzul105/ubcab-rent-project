"use client";
// import { useState } from 'react';

// export default function Language() {
//   const [lang, setLang] = useState<'EN' | 'MN'>('MN');

//   const toggleLang = (selected: 'EN' | 'MN') => {
//     setLang(selected);
//   };

//   return (

//       <div style={{ display: "flex", gap: "5px" }}>
//         <button
//           onClick={() => toggleLang('MN')}
//           style={{
//             padding: "6px 10px",
//             border: lang === 'MN' ? "none" : "1px solid #ddd",
//             background: lang === 'MN' ? "#000" : "#fff",
//             color: lang === 'MN' ? "#fff" : "#000",
//             cursor: "pointer"
//           }}
//         >
//           EN
//         </button>
//         <button
//           onClick={() => toggleLang('EN')}
//           style={{
//             padding: "6px 10px",
//             border: lang === 'EN' ? "none" : "1px solid #ddd",
//             background: lang === 'EN' ? "#000" : "#fff",
//             color: lang === 'EN' ? "#fff" : "#000",
//             cursor: "pointer"
//           }}
//         >
//           MN
//         </button>
//       </div>

//   );
// }

import * as React from "react";
import Switch from "@mui/joy/Switch";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";

export default function Language() {
  return (
    <Stack direction="row" spacing={2}>
      <Switch
        slotProps={{
          track: {
            children: (
              <React.Fragment>
                <Typography component="span" level="inherit" sx={{ ml: "6px" }}>
                  MN
                </Typography>
                <Typography
                  component="span"
                  level="inherit"
                  sx={{ mr: "10px" }}
                >
                  EN
                </Typography>
              </React.Fragment>
            ),
          },
        }}
        sx={{
          "--Switch-thumbSize": "27px",
          "--Switch-trackWidth": "64px",
          "--Switch-trackHeight": "31px",
        }}
      />
    </Stack>
  );
}

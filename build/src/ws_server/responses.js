"use strict";
// interface regInterface {
//     name: string,
//     index: number,
//     error: boolean,
//     errorText: string,
// }
// export function sendResponse(ws: WebSocket, type: string, data: regInterface) {
// ws.send(
//     JSON.stringify({
//         type: type,
//         data: JSON.stringify({
//         })
//     })
// )
// }
// ws.send(
//     JSON.stringify({
//       type: "reg",
//       data: JSON.stringify({
//         name: data.name,
//         index: 0,
//         //TODO: implement error
//         error: false,
//         errorText: "some error",
//       }),
//       id: 0,
//     })
//   );
//   ws.send(
//     JSON.stringify({
//       type: "update_room",
//       data: JSON.stringify([
//         {
//           roomId: 0,
//           roomUsers: [
//             {
//               name: "gay_room",
//               index: 0,
//             },
//           ],
//         },
//       ]),
//       id: 0,
//     })
//   );
//   ws.send(
//     JSON.stringify({
//       type: "update_winners",
//       data: JSON.stringify([
//         {
//           name: data.name,
//           wins: 0,
//         },
//       ]),
//       id: 0,
//     })
//   );
// }
// if (type === "create_room") {
//   ws.send(
//     JSON.stringify({
//       type: "update_room",
//       data: JSON.stringify([
//         {
//           roomId: 0,
//           roomUsers: [
//             {
//               name: "gay_room",
//               index: 0,
//             },
//           ],
//         },
//       ]),
//       id: 0,
//     })
//   );
// }
// };

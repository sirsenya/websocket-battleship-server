export function sendResponse(params: {
  ws: WebSocket;
  type: string;
  data: Object;
}) {
  const string: string = JSON.stringify({
    type: params.type,
    data: JSON.stringify(params.data),
    id: 0,
  });
  //  console.log(string);
  params.ws.send(string);
}

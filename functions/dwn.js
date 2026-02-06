import { Config } from "@netlify/functions";
import { setEnv, increment } from "appcontrolcli";

exports.handler = async function (event, context) {

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const data = JSON.parse(event.body);
    const date = new Date().toISOString().slice(0, 10);

    setEnv()
    let resp = await increment('pandacub-app' ,date, data.os, data.arch)
}

export const Config = {
    path: "/api/dwn"
}
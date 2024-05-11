import * as core from "@actions/core"
import { tfcHeader } from "../../../utils"

type Project = {
    data: {
        attributes: {
            name: string
            description: string
        },
        type: "projects"
    }
}


export async function run(): Promise<void> {
    try {
        core.info("Creating project")
        core.info("Setting inputs")
        const name = core.getInput("name")
        const desc = core.getInput("description")
        const hostname = core.getInput("hostname") || process.env.TFC_ENDPOINT
        const organization = core.getInput("organization") || process.env.TFC_ORG
        const token = core.getInput("token") || process.env.TFC_TOKEN

        if (!token) throw new Error("TFC_TOKEN is not set")
        if (!hostname) throw new Error("TFC_ENDPOINT is not set")
        if (!organization) throw new Error("TFC_ORG is not set")

        core.info("Fetching project")
        const get_res = await fetch(`${hostname}/api/v2/organizations/${organization}/projects?filter%5Bnames%5D=${name}`, {
            headers: tfcHeader(token),
            method: "GET"
        })
        const getPayload = await get_res.json()
        if (get_res.ok) {
            if (getPayload.data.length > 0) {
                core.info("Project already exists")
                core.setOutput("project_id", getPayload.data[0].id)
                return
            }
        } else {
            core.setFailed(`Failed to fetch project: ${getPayload.errors[0].detail}`)
        }
        const pr: Project = {
            data: {
                attributes: {
                    name: name,
                    description: desc
                },
                type: "projects"
            }
        }
        const res = await fetch(`${hostname}/api/v2/organizations/${organization}/projects`, {
            method: "POST",
            headers: tfcHeader(token),
            body: JSON.stringify(pr)
        })
        if (res.ok) {
            core.info("Project created successfully")
            core.setOutput("project_id", (await res.json()).data.id)
        }

    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message)
    }
}

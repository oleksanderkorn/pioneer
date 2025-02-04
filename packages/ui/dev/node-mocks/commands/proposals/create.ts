/* eslint-disable no-console */
import { access, readFile } from 'fs/promises'
import { isAbsolute, resolve } from 'path'

import yargs from 'yargs'

import { createType } from '../../../../src/common/model/createType'
import { getDataFromEvent } from '../../../../src/common/model/JoystreamNode'
import memberData from '../../../../src/mocks/data/raw/members.json'
import { signAndSend, withApi } from '../../lib/api'
import { createMembersCommand } from '../members/create'

const options = {
  upgrade: {
    type: 'string',
    alias: 'u',
    describe: 'Path to the runtime upgrade wasm file',
  },
} as const

type CommandOptions = yargs.InferredOptionTypes<typeof options>
export type Args = yargs.Arguments<CommandOptions>

const createProposal = (args: Args) => {
  withApi(async (api) => {
    const aliceMember = memberData[0]

    // Create accounts
    const nextId = await api.query.members.nextMemberId()
    if (Number(nextId) < 1) {
      await createMembersCommand()
    }

    // Create proposal
    const id = aliceMember.id
    const address = aliceMember.controllerAccount

    const commonParams = {
      memberId: id,
      title: `Lorem ${Object.keys(args)[0]}`,
      description: JSON.stringify(args, null, 2),
      stakingAccountId: address,
    }
    const proposalDetails = await specificParams(args)

    const tx = api.tx.proposalsCodex.createProposal(commonParams, proposalDetails)
    const events = await signAndSend(tx, address)

    const proposalId = Number(getDataFromEvent(events, 'proposalsCodex', 'ProposalCreated'))
    const proposalData = getDataFromEvent(events, 'proposalsCodex', 'ProposalCreated', 1)
    const threadId = Number(getDataFromEvent(events, 'proposalsDiscussion', 'ThreadCreated'))
    console.log({ proposalId, ...proposalData?.toJSON(), threadId })
  })
}

const specificParams = async (args: Args) => {
  if (args.upgrade) {
    const file = await readFile(await filePath(args.upgrade))
    return createType('PalletProposalsCodexProposalDetails', {
      RuntimeUpgrade: [createType('Bytes', new Uint8Array(file))],
    })
  } else {
    throw Error('Unknown proposal type')
  }
}

const filePath = async (path: string) => {
  if (isAbsolute(path)) {
    return path
  }
  try {
    const fromPackageRoot = resolve(process.cwd(), path)
    await access(fromPackageRoot)
    return fromPackageRoot
  } catch (err) {
    const fromProjectRoot = resolve(process.cwd(), '../..', path)
    await access(fromProjectRoot)
    return fromProjectRoot
  }
}

export const createProposalModule = {
  command: 'proposal:create',
  describe: 'Create a proposal',
  handler: createProposal,
  builder: (argv: yargs.Argv<unknown>) => argv.options(options),
}

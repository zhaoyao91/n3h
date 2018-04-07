const includes = require('lodash.includes')
const ensureArray = require('ensure-array')
const isEqual = require('lodash.isequal')
const {inspect} = require('util')

/**
 * @param {object[]} definitions - see {@link https://github.com/zhaoyao91/n3h/blob/master/packages/step-adapter/api.md#adaptdefinition--externalstandarditemdefinition | step-definition}
 * @param {object} options
 * @param {string} options.serviceName
 * @param {string} options.flowName
 * @param {string[]} options.entries - step names of entries
 * @param {string[][]} options.follows - each item is [followingStepName, followedStepName, followedStepCase]
 */
function checkFlow (definitions, options) {
  const {
    serviceName,
    flowName,
    entries,
    follows,
  } = options

  checkServiceName(definitions, serviceName)
  checkFlowName(definitions, flowName)
  checkDuplicateSteps(definitions)
  checkEntries(definitions, entries)
  checkFollows(definitions, follows)
  checkEntriesCoverage(definitions, entries)
  checkFollowsCoverage(definitions, follows)
}

module.exports = checkFlow

function checkServiceName (definitions, serviceName) {
  definitions.forEach(x => {
    if (x.serviceName !== serviceName) {
      throw new Error(`wrong service name: ${inspect(x)}`)
    }
  })
}

function checkFlowName (definitions, flowName) {
  definitions.forEach(x => {
    if (x.flowName !== flowName) {
      throw new Error(`wrong flow name: ${inspect(x)}`)
    }
  })
}

function checkDuplicateSteps (definitions) {
  const stepNames = definitions.map(x => x.stepName)
  const duplicateStepNames = findDuplicates(stepNames)
  if (duplicateStepNames.length > 0) {
    throw new Error(`found duplicate steps: ${inspect(duplicateStepNames)}`)
  }
}

function checkEntries (definitions, entries) {
  entries.forEach(entryStepName => {
    const definition = definitions.find(x => x.stepName === entryStepName)
    if (!definition) {
      throw new Error(`cannot find entry step: ${entryStepName}`)
    }
    if (definition.follow) {
      throw new Error(`step is not entry: ${inspect(definition)}`)
    }
  })
}

function checkFollows (definitions, follows) {
  follows.forEach(([followingStepName, followedStepName, followedStepCase]) => {
    const followingStep = definitions.find(x => x.stepName === followingStepName)
    const followedStep = definitions.find(x => x.stepName === followedStepName)

    const follow = [followingStepName, followedStepName, followedStepCase]

    if (!followingStep) {
      throw new Error(`cannot find following step: ${inspect(follow)}`)
    }
    if (!followedStep) {
      throw new Error(`cannot find followed step: ${inspect(follow)}`)
    }
    if (!includes(followedStep.emitCases, followedStepCase)) {
      throw new Error(`followed step does not emit this case: ${inspect(follow)}`)
    }
    if (!ensureArray(followingStep.follow).find(x => x.step === followedStepName && x.case === followedStepCase)) {
      throw new Error(`cannot find this follow relation: ${inspect(follow)}`)
    }
  })
}

function checkEntriesCoverage (definitions, entries) {
  definitions.forEach(x => {
    if (!x.follow && !includes(entries, x.stepName)) {
      throw new Error(`some entry step is not checked: ${inspect(x)}`)
    }
  })
}

function checkFollowsCoverage (definitions, follows) {
  definitions.forEach(x => {
    ensureArray(x.follow).forEach(follow => {
      const followingStepName = x.stepName
      const followedStepName = follow.step
      const followedStepCase = follow.case
      const toFindFollow = [followingStepName, followedStepName, followedStepCase]
      if (!follows.find(follow => isEqual(follow, toFindFollow))) {
        throw new Error(`some follow relation is not checked: ${inspect(toFindFollow)}`)
      }
    })
  })
}

function findDuplicates (array) {
  const checked = new Set()
  const duplicated = new Set()
  array.forEach(x => {
    if (!checked.has(x)) {
      checked.add(x)
    } else {
      duplicated.add(x)
    }
  })
  return Array.from(duplicated)
}
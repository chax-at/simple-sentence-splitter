#!/usr/bin/env node

// @ts-check
'use strict';

if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[0]} ${process.argv[1]} <message>`);
  process.exit(-1);
}

/**
 * @param {string} message
 * @returns {Promise<void>}
 */
async function run(message) {
  console.log(`> Say '${message}', Roger.`);
  await new Promise((resolve) => setTimeout(resolve, 700));
  console.log(`"${message}, Roger."`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

run(process.argv.slice(2).join(' '));

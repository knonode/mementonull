# Memento Mori World Population Simulator

## Overview
This is a world's first on-chain population simulator. Circulating supply is the current population number. Every hour newborn people minus deceased are added to circulating supply, following a curve based on United Nations Population Division data projections.

The reserve account is funded to run until year 2100 or until reaching total supply or in case fee structure changes on Algorand protocol.

## Concept
A philosophical discussion conceived as an Algorand ASA with a fluctuating circulating supply pegged to the amount of people living on planet Earth at present time.

The project, being built on Algorand and closely tied to the monetary system as such, asks questions about the worth of a human life. One $MEMO represents one living human, and in principle every human being on the planet and orbiting it, is accredited with one $MEMO.

## Data
Data is extracted from United Nations World Population Prospects 2022 (WPP 2022)

Current page [here](https://population.un.org/wpp/)

## Algorithm

It's fairly simple. We have two projected population numbers for each year. So we determine how far we are between two data points, year start or middle and year end, and do a linear interpolation.

## Population Projection
![World Population Projection](/docs/charts/probability-projection.svg)

## Animation
Matter.js serves as the physics engine. The simulation creates two ragdolls per second, representing global population changes of approximately 0.84% per year (2024), which translates to about 4.2 births and 2 deaths per second worldwide.

The ragdolls, designed as small Hampelmen, fall into the world and encounter a rotating deflector positioned just above the window's top edge. This deflector changes both its direction and rotation speed randomly.

Users can interact with the simulation by grabbing fallen Hampelmen and tossing them into the sorting pipes.

## Important Note
This token will never be made available for trading and is made only for educational and entertainment purposes. It has freeze and clawback enabled to keep options for further development open.

## Project Accounts
- **Creator Account:** `DEAXD24NWYIBUKALDZEMEMZCM6D4ANNTDB2VUKXOH3YO3SUONGZSXQZLGU`
- **Reserve Account:** `LOGOSKGASR2WUTFBRQQSGOJT7QBXWQV7HWGTLYRBVGLJQFVLH2BR5NGQZQ`
- **Receiver Account (mementomori.algo):** `ORBISXYDPXH4MGICPYHQLLSHH7IYMXECPJIG5N5M3GMKZ7MHRLBFHZLOFE`

## Credits
- **Concept:** Hampelman
- **Development:** RunVnc (token script and population data curve)
- **Special Thanks:** Null (ragdoll physics and website prototype)

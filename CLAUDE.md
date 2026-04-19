# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A minimalist, mobile-first flashcard web app for studying drugs from paramedic protocols. Static front end that renders flashcards from JSON data.

## Architecture

- Static site — no backend, no build step unless one is later introduced.
- Drug data lives in JSON and is consumed directly by the front end to render cards.
- Mobile-first: design and test at phone widths before scaling up.

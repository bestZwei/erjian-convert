# Erjian Convert (二简转换器)

A web-based tool to convert text between standard Simplified Chinese and various versions of the **Second-round Simplified Chinese characters** (also known as **Erjian** or 二简字).

## What are Second-round Simplified Chinese Characters (Erjian)?

The Second-round Simplified Chinese characters scheme was a set of simplified characters promulgated by the People's Republic of China in 1977. It aimed to further simplify Chinese writing beyond the first round of simplification.

The scheme included two lists (tables):
*   **Table 1 (第一表):** Contained 248 characters intended for immediate use, replacing their traditional/first-round counterparts.
*   **Table 2 (第二表):** Contained 605 characters intended for trial use, primarily in printing.

## Features

This tool allows you to convert standard Simplified Chinese text into:
*   **Draft Table 1 (草案第一表):** Uses simplifications from the first table of the 1977 draft.
*   **Draft Tables 1 & 2 (草案两表):** Uses simplifications from both tables of the 1977 draft.
*   **Revised Draft (修订草案):** Uses simplifications based on the later, unreleased revised draft.

It also provides functionality to convert text *back* from these Erjian versions to standard Simplified Chinese (using the "一简" button).

## Usage

1.  Open `index.html` in your web browser.
2.  Paste or type the text you want to convert into the text area.
3.  Click one of the buttons below the text area to perform the conversion:
    *   **一简:** Convert *from* Erjian back to standard Simplified Chinese.
    *   **草案第一表:** Convert *to* Erjian using Draft Table 1.
    *   **草案两表:** Convert *to* Erjian using Draft Tables 1 & 2.
    *   **修订草案:** Convert *to* Erjian using the Revised Draft.
4.  The converted text will appear in the text area.

**Note:** Due to the inherent ambiguity of some Erjian characters and potential overlaps, the conversion might not always be perfect, especially when converting back to standard Simplified Chinese. Please report any conversion errors via GitHub Issues.

# skills

My personal agent skills for Claude Code, Codex, Cursor, and other agents that support the [skills](https://skills.sh) format.

## Install

```bash
npx skills add tonylxm/skills
```

To install a single skill:

```bash
npx skills add tonylxm/skills --skill decision-log
```

## Skills

| Skill | Description | Origin |
| --- | --- | --- |
| [decision-log](decision-log/SKILL.md) | Record significant decisions as ADRs | Original |
| [grill-me](grill-me/SKILL.md) | A relentless interview to sharpen a plan or design | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [grill-with-docs](grill-with-docs/SKILL.md) | Grill-me that also writes ADRs and a glossary | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [tdd](tdd/SKILL.md) | Test-driven development, red-green-refactor | Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) |
| [find-skills](find-skills/SKILL.md) | Discover and install agent skills | Adapted from [vercel-labs/skills](https://github.com/vercel-labs/skills) |

The adapted skills may be personalised, so they can differ from upstream. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for their licenses.

## License

Original skills are released under the [MIT License](LICENSE).

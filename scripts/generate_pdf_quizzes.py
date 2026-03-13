import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


@dataclass
class PdfSource:
    pdf_path: Path
    subject: str
    slug_prefix: str


SOURCES = [
    PdfSource(
        pdf_path=Path(
            r"c:\Users\Maquina 17\Downloads\Apostila Completa de Redes de Computadores ID 206.pdf"
        ),
        subject="Redes de Computadores",
        slug_prefix="redes-de-computadores",
    ),
    PdfSource(
        pdf_path=Path(
            r"c:\Users\Maquina 17\Downloads\Apostila Completa de Administrativo Informatizado V4 Id 679.pdf"
        ),
        subject="Administrativo Informatizado",
        slug_prefix="administrativo-informatizado",
    ),
]


SKIP_TITLES = (
    "exercicio",
    "exercicios",
    "exemplo",
    "exemplos",
    "objetivo",
    "passo a passo",
    "passos",
    "vantagens",
    "desvantagens",
    "caracteristicas principais",
    "como acessar",
    "anotacoes",
    "execucao do exercicio",
    "finalizacao",
)


GENERIC_FILLERS = [
    ("conceito central", "tema principal apresentado na aula"),
    ("aplicacao pratica", "uso do conteudo em uma atividade cotidiana"),
    ("organizacao", "maneira de estruturar recursos e informacoes"),
    ("procedimento", "sequencia de acoes para executar uma tarefa"),
]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_only.lower()).strip("-")
    return slug


def normalize_text(value: str) -> str:
    value = value.replace("\x00", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def strip_page_artifacts(value: str) -> str:
    lines = []
    for line in value.splitlines():
        cleaned = line.strip()
        if not cleaned:
            continue
        if re.fullmatch(r"\d+\s+de\s+\d+", cleaned):
            continue
        lines.append(cleaned)
    return "\n".join(lines)


def detect_lessons(page_texts: list[str]) -> list[tuple[int, int, str]]:
    lessons = []
    lesson_marker = re.compile(r"\bAula\s*(?:\r?\n)+(\d+)\b", re.IGNORECASE)

    for page_index, text in enumerate(page_texts):
        marker = lesson_marker.search(text)
        if not marker:
            continue

        lesson_number = int(marker.group(1))
        title_pattern = re.compile(
            rf"{lesson_number}\.\s+(.+?)\s+Aula\s*(?:\r?\n)+{lesson_number}\b",
            re.IGNORECASE | re.DOTALL,
        )
        title_match = title_pattern.search(text)
        if not title_match:
            continue

        title = normalize_text(title_match.group(1)).rstrip(".")
        lessons.append((lesson_number, page_index, title))

    lessons.sort(key=lambda item: item[0])
    return lessons


def merge_broken_heading(title: str, body_lines: list[str]) -> tuple[str, list[str]]:
    if not body_lines:
        return title, body_lines

    first_line = body_lines[0]
    first_line_word_count = len(first_line.split())
    if first_line_word_count <= 5 and not first_line.endswith(":"):
        title = normalize_text(f"{title} {first_line}")
        body_lines = body_lines[1:]
    return title, body_lines


def extract_definition(body: str) -> str:
    body = strip_page_artifacts(body)
    lines = [line.strip() for line in body.splitlines() if line.strip()]
    if not lines:
        return ""

    joined = " ".join(lines[:6])
    joined = normalize_text(joined)
    sentences = re.split(r"(?<=[.!?])\s+", joined)
    for sentence in sentences:
        if len(sentence.split()) >= 8:
            return sentence.rstrip(".?!")

    words = joined.split()
    return " ".join(words[:20]).rstrip(".?!")


def is_valid_heading(title: str, definition: str) -> bool:
    title_slug = slugify(title)
    if not title_slug:
        return False

    if any(title_slug.startswith(slugify(prefix)) for prefix in SKIP_TITLES):
        return False

    if len(definition.split()) < 6:
        return False

    return True


def extract_concepts(lesson_number: int, lesson_text: str, lesson_title: str) -> list[tuple[str, str]]:
    lesson_text = strip_page_artifacts(lesson_text)
    heading_pattern = re.compile(rf"(?m)^({lesson_number}\.\d+(?:\.\d+)*)\.\s+(.+)$")
    matches = list(heading_pattern.finditer(lesson_text))
    concepts: list[tuple[str, str]] = []
    seen_titles = set()

    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(lesson_text)
        body = lesson_text[start:end]
        body_lines = [line.strip() for line in body.splitlines() if line.strip()]
        title, body_lines = merge_broken_heading(normalize_text(match.group(2)).rstrip("."), body_lines)
        definition = extract_definition("\n".join(body_lines))

        title_key = slugify(title)
        if title_key in seen_titles:
            continue
        if not is_valid_heading(title, definition):
            continue

        concepts.append((title, definition))
        seen_titles.add(title_key)

    if len(concepts) < 5:
        intro_match = heading_pattern.search(lesson_text)
        intro_end = intro_match.start() if intro_match else len(lesson_text)
        intro_definition = extract_definition(lesson_text[:intro_end])
        if intro_definition:
            concepts.insert(0, (lesson_title, intro_definition))

    for filler_title, filler_definition in GENERIC_FILLERS:
        if len(concepts) >= 5:
            break
        concepts.append((filler_title, filler_definition))

    return concepts[:5]


def build_option_set(items: list[str], correct_index: int) -> list[tuple[str, str]]:
    option_ids = ["a", "b", "c", "d"]
    return [{"id": option_ids[idx], "text": items[idx]} for idx in range(4)], option_ids[correct_index]


def rotated_indices(total: int, start: int) -> list[int]:
    values = list(range(total))
    return values[start:] + values[:start]


def build_forward_question(
    question_id: int,
    prompt: str,
    concepts: list[tuple[str, str]],
    concept_index: int,
    difficulty: str,
) -> dict:
    total = len(concepts)
    order = rotated_indices(total, concept_index)
    chosen = order[:4]
    if concept_index not in chosen:
        chosen[-1] = concept_index
    chosen = sorted(chosen)
    correct_position = chosen.index(concept_index)
    option_texts = [concepts[idx][1] for idx in chosen]
    options, correct_option = build_option_set(option_texts, correct_position)

    return {
        "id": f"q{question_id}",
        "statement": prompt.format(concept=concepts[concept_index][0]),
        "difficulty": difficulty,
        "options": options,
        "correctOptionId": correct_option,
    }


def build_reverse_question(
    question_id: int,
    prompt: str,
    concepts: list[tuple[str, str]],
    concept_index: int,
    difficulty: str,
) -> dict:
    total = len(concepts)
    order = rotated_indices(total, concept_index)
    chosen = order[:4]
    if concept_index not in chosen:
        chosen[-1] = concept_index
    chosen = sorted(chosen)
    correct_position = chosen.index(concept_index)
    option_texts = [concepts[idx][0] for idx in chosen]
    options, correct_option = build_option_set(option_texts, correct_position)

    return {
        "id": f"q{question_id}",
        "statement": prompt.format(description=concepts[concept_index][1]),
        "difficulty": difficulty,
        "options": options,
        "correctOptionId": correct_option,
    }


def build_questions(level: str, concepts: list[tuple[str, str]]) -> list[dict]:
    if level == "Basico":
        questions = [
            build_forward_question(
                idx + 1,
                "Qual alternativa define corretamente {concept}?",
                concepts,
                idx,
                "Facil",
            )
            for idx in range(5)
        ]
        questions.extend(
            [
                build_reverse_question(
                    6,
                    "Qual conceito corresponde a descricao: {description}?",
                    concepts,
                    0,
                    "Facil",
                ),
                build_reverse_question(
                    7,
                    "Qual conceito corresponde a descricao: {description}?",
                    concepts,
                    1,
                    "Facil",
                ),
                build_reverse_question(
                    8,
                    "Qual conceito corresponde a descricao: {description}?",
                    concepts,
                    2,
                    "Medio",
                ),
                build_reverse_question(
                    9,
                    "Qual conceito corresponde a descricao: {description}?",
                    concepts,
                    3,
                    "Medio",
                ),
                build_reverse_question(
                    10,
                    "Qual conceito corresponde a descricao: {description}?",
                    concepts,
                    4,
                    "Medio",
                ),
            ]
        )
        return questions

    if level == "Intermediario":
        questions = [
            build_forward_question(
                idx + 1,
                "Durante uma rotina de estudo, a equipe citou {concept}. Qual descricao esta correta para aplicar o conceito?",
                concepts,
                idx,
                "Medio",
            )
            for idx in range(5)
        ]
        questions.extend(
            [
                build_reverse_question(
                    6,
                    "Em um caso pratico, observou-se: {description}. Qual conceito deve ser identificado?",
                    concepts,
                    0,
                    "Medio",
                ),
                build_reverse_question(
                    7,
                    "Em um caso pratico, observou-se: {description}. Qual conceito deve ser identificado?",
                    concepts,
                    1,
                    "Dificil",
                ),
                build_reverse_question(
                    8,
                    "Em um caso pratico, observou-se: {description}. Qual conceito deve ser identificado?",
                    concepts,
                    2,
                    "Dificil",
                ),
                build_reverse_question(
                    9,
                    "Em um caso pratico, observou-se: {description}. Qual conceito deve ser identificado?",
                    concepts,
                    3,
                    "Dificil",
                ),
                build_reverse_question(
                    10,
                    "Em um caso pratico, observou-se: {description}. Qual conceito deve ser identificado?",
                    concepts,
                    4,
                    "Dificil",
                ),
            ]
        )
        return questions

    questions = [
        build_forward_question(
            1,
            "Em uma analise tecnica, foi necessario diferenciar {concept} de conceitos proximos. Qual descricao e mais precisa?",
            concepts,
            0,
            "Medio",
        ),
        build_forward_question(
            2,
            "Em uma analise tecnica, foi necessario diferenciar {concept} de conceitos proximos. Qual descricao e mais precisa?",
            concepts,
            1,
            "Medio",
        ),
        build_forward_question(
            3,
            "Em uma analise tecnica, foi necessario diferenciar {concept} de conceitos proximos. Qual descricao e mais precisa?",
            concepts,
            2,
            "Medio",
        ),
        build_forward_question(
            4,
            "Em uma analise tecnica, foi necessario diferenciar {concept} de conceitos proximos. Qual descricao e mais precisa?",
            concepts,
            3,
            "Dificil",
        ),
        build_forward_question(
            5,
            "Em uma analise tecnica, foi necessario diferenciar {concept} de conceitos proximos. Qual descricao e mais precisa?",
            concepts,
            4,
            "Dificil",
        ),
        build_reverse_question(
            6,
            "Para tomada de decisao, considere a descricao: {description}. Qual conceito representa melhor essa condicao?",
            concepts,
            0,
            "Dificil",
        ),
        build_reverse_question(
            7,
            "Para tomada de decisao, considere a descricao: {description}. Qual conceito representa melhor essa condicao?",
            concepts,
            1,
            "Dificil",
        ),
        build_reverse_question(
            8,
            "Para tomada de decisao, considere a descricao: {description}. Qual conceito representa melhor essa condicao?",
            concepts,
            2,
            "Dificil",
        ),
        build_reverse_question(
            9,
            "Para tomada de decisao, considere a descricao: {description}. Qual conceito representa melhor essa condicao?",
            concepts,
            3,
            "Dificil",
        ),
        build_reverse_question(
            10,
            "Para tomada de decisao, considere a descricao: {description}. Qual conceito representa melhor essa condicao?",
            concepts,
            4,
            "Dificil",
        ),
    ]
    return questions


def build_quiz_payload(subject: str, lesson_number: int, lesson_title: str, level: str, concepts: list[tuple[str, str]]) -> dict:
    return {
        "title": f"Quiz - {subject} Aula {lesson_number} - {level}",
        "subject": subject,
        "lesson": f"Aula {lesson_number} - {lesson_title}",
        "level": level,
        "questions": build_questions(level, concepts),
    }


def write_quiz_files(source: PdfSource) -> list[Path]:
    reader = PdfReader(str(source.pdf_path))
    page_texts = [page.extract_text() or "" for page in reader.pages]
    lessons = detect_lessons(page_texts)
    written_files: list[Path] = []

    for index, (lesson_number, start_page, lesson_title) in enumerate(lessons):
        end_page = lessons[index + 1][1] if index + 1 < len(lessons) else len(page_texts)
        lesson_text = "\n".join(page_texts[start_page:end_page])
        concepts = extract_concepts(lesson_number, lesson_text, lesson_title)

        for level in ("Basico", "Intermediario", "Avancado"):
            payload = build_quiz_payload(source.subject, lesson_number, lesson_title, level, concepts)
            filename = f"{source.slug_prefix}-aula{lesson_number}-{slugify(level)}.json"
            output_path = DATA_DIR / filename
            output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            written_files.append(output_path)

    return written_files


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    all_files: list[Path] = []
    for source in SOURCES:
        all_files.extend(write_quiz_files(source))
    print(f"Generated {len(all_files)} quiz files.")


if __name__ == "__main__":
    main()

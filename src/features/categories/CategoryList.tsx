import { ICONS, type IconKey } from '../../components/ui/icons'
import type { Category } from '../../types/domain'
import { CATEGORY_COLOR_TOKENS } from './colors'
import styles from './CategoryList.module.css'

interface CategoryListProps {
  categories: Category[]
  archived?: boolean
  onEdit?: (category: Category) => void
  onArchive?: (category: Category) => void
  onUnarchive?: (category: Category) => void
  onDelete: (category: Category) => void
}

function CategoryGroup({
  title,
  items,
  archived,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  title: string
  items: Category[]
} & Pick<CategoryListProps, 'archived' | 'onEdit' | 'onArchive' | 'onUnarchive' | 'onDelete'>) {
  return (
    <section className={styles.group}>
      <p className="label">{title}</p>
      {items.length === 0 ? (
        <p className={styles.empty}>{archived ? 'Ninguna archivada.' : 'Sin categorías todavía.'}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((category) => {
            const Icon = ICONS[category.icon as IconKey] ?? ICONS.other
            const tone = CATEGORY_COLOR_TOKENS[category.color]
            return (
              <li key={category.id} className={styles.row}>
                <span className={styles.icon} style={{ background: tone.bg, color: tone.text }}>
                  <Icon />
                </span>
                <span className={styles.name}>{category.name}</span>
                <div className={styles.actions}>
                  {archived ? (
                    <button type="button" onClick={() => onUnarchive?.(category)}>
                      Reactivar
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => onEdit?.(category)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => onArchive?.(category)}>
                        Archivar
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => onDelete(category)}>
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function CategoryList({ categories, archived, onEdit, onArchive, onUnarchive, onDelete }: CategoryListProps) {
  const expenses = categories.filter((c) => c.type === 'expense')
  const incomes = categories.filter((c) => c.type === 'income')

  return (
    <div className={styles.groups}>
      <CategoryGroup
        title="Gastos"
        items={expenses}
        archived={archived}
        onEdit={onEdit}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onDelete={onDelete}
      />
      <CategoryGroup
        title="Ingresos"
        items={incomes}
        archived={archived}
        onEdit={onEdit}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onDelete={onDelete}
      />
    </div>
  )
}

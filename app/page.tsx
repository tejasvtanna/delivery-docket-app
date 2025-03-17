export default async function HomePage(props: {
  searchParams: Promise<{ q: string; offset: string }>
}) {
  const searchParams = await props.searchParams
  const search = searchParams.q ?? ''
  const offset = searchParams.offset ?? 0

  return <div>Home Page</div>
}

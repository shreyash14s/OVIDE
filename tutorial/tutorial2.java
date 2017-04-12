public class tutorial2 {
	public static void main(String[] args) {
	int i,j;
	int count = 3;
	for (i = 0; i < count; ++i)
	{
		for (j = 0; j < count; ++j)
		{
			if(i==count-j)
				System.out.print(1 + "\t");
			else
				System.out.print(0 + "\t");
		}
		System.out.println();
	}
	}
}